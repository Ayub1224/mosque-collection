
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, isAdminEmail } from "@/auth";
import {
  COLLECTIONS_SHEET_RANGE,
  MEMBERS_SHEET_RANGE,
  getGoogleSheetsClient,
  getSpreadsheetId,
} from "@/lib/google-sheets";
import { collectionSchema } from "@/lib/validations/collection.schema";
import type { Collection } from "@/types/collection";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: COLLECTIONS_SHEET_RANGE,
    });

    const rows = response.data.values ?? [];

    const collections: Collection[] = rows.slice(1).map((row) => {
      const donationDate = String(row[3] ?? "");

      return {
        collectionId: String(row[0] ?? ""),
        memberId: String(row[1] ?? ""),
        amount: Number(row[2] ?? 0),
        donationDate,
        recordStatus: row[4] === "Cancelled" ? "Cancelled" : "Active",
        note: String(row[5] ?? ""),
        createdAt: String(row[6] ?? ""),
        updatedAt: String(row[7] ?? ""),
        paymentType: row[8] === "Yearly" ? "Yearly" : "Monthly",
        paymentGroupId: String(row[9] ?? ""),
        paymentReceivedDate: String(row[10] ?? donationDate),
      };
    });

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error("Fetch collections error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch collections. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const validation = collectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted collection details.",
          errors: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const values = validation.data;

    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    // Verify that the selected member exists.
    const membersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MEMBERS_SHEET_RANGE,
    });

    const memberRows = membersResponse.data.values ?? [];

    const memberExists = memberRows
      .slice(1)
      .some((row) => String(row[0] ?? "") === values.memberId);

    if (!memberExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected member does not exist.",
        },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();
    const isYearlyPayment = values.isYearlyPayment;
    const paymentGroupId = isYearlyPayment
      ? `PAY-${randomUUID()}`
      : "";

    let collections: Collection[];

    if (isYearlyPayment) {
      const [receivedYear, receivedMonth] = values.donationDate
        .split("-")
        .map(Number);

      // Indian financial year: April to March.
      const financialYearStart =
        receivedMonth >= 4 ? receivedYear : receivedYear - 1;

      collections = Array.from({ length: 12 }, (_, index) => {
        const allocationDate = new Date(
          Date.UTC(financialYearStart, 3 + index, 1),
        )
          .toISOString()
          .slice(0, 10);

        return {
          collectionId: `COL-${randomUUID()}`,
          memberId: values.memberId,
          amount: values.amount / 12,
          donationDate: allocationDate,
          recordStatus: "Active",
          note: values.note,
          createdAt: now,
          updatedAt: now,
          paymentType: "Yearly",
          paymentGroupId,
          paymentReceivedDate: values.donationDate,
        };
      });
    } else {
      collections = [
        {
          collectionId: `COL-${randomUUID()}`,
          memberId: values.memberId,
          amount: values.amount,
          donationDate: values.donationDate,
          recordStatus: "Active",
          note: values.note,
          createdAt: now,
          updatedAt: now,
          paymentType: "Monthly",
          paymentGroupId: "",
          paymentReceivedDate: values.donationDate,
        },
      ];
    }

    // Append all records in one Google Sheets request.
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: COLLECTIONS_SHEET_RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: collections.map((collection) => [
          collection.collectionId,
          collection.memberId,
          collection.amount,
          collection.donationDate,
          collection.recordStatus,
          collection.note,
          collection.createdAt,
          collection.updatedAt,
          collection.paymentType,
          collection.paymentGroupId,
          collection.paymentReceivedDate,
        ]),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: isYearlyPayment
          ? "Yearly collection recorded successfully."
          : "Collection recorded successfully.",
        collection: collections[0],
        collections,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create collection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to record collection. Please try again.",
      },
      { status: 500 },
    );
  }
}
