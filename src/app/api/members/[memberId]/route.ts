
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

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

function mapMember(row: string[]): Member {
  return {
    memberId: String(row[0] ?? ""),
    fullName: String(row[1] ?? ""),
    phoneNumber: String(row[2] ?? ""),
    address: String(row[3] ?? ""),
    joiningDate: String(row[4] ?? ""),
    status: row[5] === "Inactive" ? "Inactive" : "Active",
    createdAt: String(row[6] ?? ""),
    updatedAt: String(row[7] ?? ""),
    serialNo: String(row[8] ?? ""),
  };
}

async function getAuthorizedAdmin() {
  const session = await auth();

  return !!session?.user?.email && isAdminEmail(session.user.email);
}

// GET /api/members/[memberId]
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    if (!(await getAuthorizedAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const { memberId } = await params;
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MEMBERS_SHEET_RANGE,
    });

    const rows = response.data.values ?? [];
    const row = rows.slice(1).find(
      (item) => String(item[0] ?? "") === memberId,
    );

    if (!row) {
      return NextResponse.json(
        { success: false, message: "Member not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      member: mapMember(row),
    });
  } catch (error) {
    console.error("Fetch member error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch member." },
      { status: 500 },
    );
  }
}

// PATCH /api/members/[memberId]
export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    if (!(await getAuthorizedAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const { memberId } = await params;
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

    const values = validation.data;
    const phoneNumber = normalizePhoneNumber(values.phoneNumber);

    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MEMBERS_SHEET_RANGE,
    });

    const rows = response.data.values ?? [];
    const memberIndex = rows.slice(1).findIndex(
      (row) => String(row[0] ?? "") === memberId,
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Member not found." },
        { status: 404 },
      );
    }

    const existingRow = rows[memberIndex + 1];

    const duplicateExists = rows.slice(1).some((row, index) => {
      if (index === memberIndex) return false;

      const existingPhone = String(row[2] ?? "");

      return (
        existingPhone &&
        normalizePhoneNumber(existingPhone) === phoneNumber
      );
    });

    if (duplicateExists) {
      return NextResponse.json(
        {
          success: false,
          message: "This phone number is already registered.",
        },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const rowNumber = memberIndex + 2;

    const updatedMember: Member = {
      memberId,
      fullName: values.fullName,
      phoneNumber,
      address: values.address,
      joiningDate: values.joiningDate,
      status: existingRow[5] === "Inactive" ? "Inactive" : "Active",
      createdAt: String(existingRow[6] ?? ""),
      updatedAt: now,
      serialNo: String(existingRow[8] ?? ""),
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Members!A${rowNumber}:I${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          updatedMember.memberId,
          updatedMember.fullName,
          updatedMember.phoneNumber,
          updatedMember.address,
          updatedMember.joiningDate,
          updatedMember.status,
          updatedMember.createdAt,
          updatedMember.updatedAt,
          updatedMember.serialNo,
        ]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member updated successfully.",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Update member error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update member." },
      { status: 500 },
    );
  }
}

// DELETE /api/members/[memberId]
// Soft delete: mark the member as Inactive.
export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    if (!(await getAuthorizedAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const { memberId } = await params;
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MEMBERS_SHEET_RANGE,
    });

    const rows = response.data.values ?? [];
    const memberIndex = rows.slice(1).findIndex(
      (row) => String(row[0] ?? "") === memberId,
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Member not found." },
        { status: 404 },
      );
    }

    const existingRow = rows[memberIndex + 1];
    const rowNumber = memberIndex + 2;
    const now = new Date().toISOString();

    const updatedRow = [
      ...existingRow.slice(0, 5),
      "Inactive",
      existingRow[6] ?? "",
      now,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Members!A${rowNumber}:H${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [updatedRow],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate member error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to deactivate member." },
      { status: 500 },
    );
  }
}
