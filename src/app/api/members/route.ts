
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, isAdminEmail } from "@/auth";
import {
  getGoogleSheetsClient,
  getSpreadsheetId,
  MEMBERS_SHEET_RANGE,
} from "@/lib/google-sheets";
import {
  memberSchema,
  normalizePhoneNumber,
} from "@/lib/validations/member.schema";
import type { Member } from "@/types/member";

// Prevent duplicate registrations within the same running server instance.
const phoneLocks = new Map<string, Promise<void>>();

async function withPhoneLock<T>(
  phoneNumber: string,
  callback: () => Promise<T>,
): Promise<T> {
  const previousLock = phoneLocks.get(phoneNumber) ?? Promise.resolve();

  let releaseLock!: () => void;

  const currentLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  phoneLocks.set(phoneNumber, currentLock);

  await previousLock;

  try {
    return await callback();
  } finally {
    releaseLock();

    if (phoneLocks.get(phoneNumber) === currentLock) {
      phoneLocks.delete(phoneNumber);
    }
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify administrator authentication.
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    // 2. Read and validate request body.
    const body: unknown = await request.json();
    const validation = memberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted member details.",
          errors: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    // 3. Normalize the phone number.
    const values = validation.data;
    const phoneNumber = normalizePhoneNumber(values.phoneNumber);

    // 4. Check for duplicates and save the member.
    const result = await withPhoneLock(phoneNumber, async () => {
      const sheets = getGoogleSheetsClient();
      const spreadsheetId = getSpreadsheetId();

      const existingMembers = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: MEMBERS_SHEET_RANGE,
      });

      const rows = existingMembers.data.values ?? [];

      const duplicateExists = rows.slice(1).some((row) => {
        const existingPhone = String(row[2] ?? "");

        return (
          existingPhone &&
          normalizePhoneNumber(existingPhone) === phoneNumber
        );
      });

      if (duplicateExists) {
        return null;
      }

      // 5. Generate member ID and timestamps.
      const now = new Date().toISOString();
      const memberId = `MEM-${randomUUID()}`;

      // 6. Append the new member to Google Sheets.
      const validSerials = rows.slice(1).map((row) => String(row[8] ?? ""));
      const highestSerial = validSerials.reduce((highest, serialNo) => {
        return /^\d{3}$/.test(serialNo)
          ? Math.max(highest, Number(serialNo))
          : highest;
      }, 0);

      if (rows.length - 1 >= 999 || highestSerial >= 999) {
        throw new Error("No 3-digit member serial numbers remain.");
      }

      // Google Sheets returns the actual row allocated by append, so concurrent
      // serverless instances derive different serials without a process-local counter.
      const appended = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Members!A:H",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [
            [
              memberId,
              values.fullName,
              phoneNumber,
              values.address,
              values.joiningDate,
              "Active",
              now,
              now,
            ],
          ],
        },
      });

      const appendedRow = Number(/!(?:A)(\d+):/.exec(appended.data.updates?.updatedRange ?? "")?.[1]);
      const nextSerial = Math.max(highestSerial, rows.length - 1) + (appendedRow - rows.length);
      if (!Number.isInteger(appendedRow) || nextSerial < 1 || nextSerial > 999) {
        throw new Error("Unable to allocate a valid member serial number.");
      }
      const serialNo = String(nextSerial).padStart(3, "0");
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Members!I${appendedRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [[serialNo]] },
      });

      return {
        memberId,
        fullName: values.fullName,
        phoneNumber,
        address: values.address,
        joiningDate: values.joiningDate,
        status: "Active",
        createdAt: now,
        updatedAt: now,
        serialNo,
      };
    });

    // 7. Return duplicate phone response.
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "This phone number is already registered.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Member registered successfully.",
        member: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Member registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to register member. Please try again.",
      },
      { status: 500 },
    );
  }
}


export async function GET() {
  try {
    // 1. Verify administrator authentication.
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    // 2. Fetch members from Google Sheets.
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MEMBERS_SHEET_RANGE,
    });

    const rows = response.data.values ?? [];

    // 3. Convert spreadsheet rows into Member objects.
    const members: Member[] = rows.slice(1).map((row) => ({
      memberId: String(row[0] ?? ""),
      fullName: String(row[1] ?? ""),
      phoneNumber: String(row[2] ?? ""),
      address: String(row[3] ?? ""),
      joiningDate: String(row[4] ?? ""),
      status: row[5] === "Inactive" ? "Inactive" : "Active",
      createdAt: String(row[6] ?? ""),
      updatedAt: String(row[7] ?? ""),
      serialNo: String(row[8] ?? ""),
    }));

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error("Fetch members error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch members. Please try again.",
      },
      { status: 500 },
    );
  }
}
