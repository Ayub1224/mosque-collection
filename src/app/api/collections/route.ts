
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
    // 1. Verify administrator authentication.
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    // 2. Fetch collection records from Google Sheets.
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: COLLECTIONS_SHEET_RANGE,
    });

    const rows = response.data.values ?? [];

    // 3. Convert spreadsheet rows into Collection objects.
    const collections: Collection[] = rows.slice(1).map((row) => ({
      collectionId: String(row[0] ?? ""),
      memberId: String(row[1] ?? ""),
      amount: Number(row[2] ?? 0),
      donationDate: String(row[3] ?? ""),
      recordStatus: row[4] === "Cancelled" ? "Cancelled" : "Active",
      note: String(row[5] ?? ""),
      createdAt: String(row[6] ?? ""),
      updatedAt: String(row[7] ?? ""),
    }));

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
    // 1. Verify administrator authentication.
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    // 2. Validate request body.
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

    // 3. Verify that the selected member exists.
    // Both Active and Inactive members are allowed.
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

    // 4. Generate collection ID and timestamps.
    const now = new Date().toISOString();
    const collectionId = `COL-${randomUUID()}`;

    const collection: Collection = {
      collectionId,
      memberId: values.memberId,
      amount: values.amount,
      donationDate: values.donationDate,
      recordStatus: "Active",
      note: values.note,
      createdAt: now,
      updatedAt: now,
    };

    // 5. Append collection record to Google Sheets.
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: COLLECTIONS_SHEET_RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            collection.collectionId,
            collection.memberId,
            collection.amount,
            collection.donationDate,
            collection.recordStatus,
            collection.note,
            collection.createdAt,
            collection.updatedAt,
          ],
        ],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Collection recorded successfully.",
        collection,
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
