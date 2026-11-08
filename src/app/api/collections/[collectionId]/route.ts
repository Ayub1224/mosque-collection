import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, isAdminEmail } from "@/auth";
import {
  COLLECTIONS_SHEET_RANGE,
  getGoogleSheetsClient,
  getSpreadsheetId,
} from "@/lib/google-sheets";
import { updateCollectionSchema } from "@/lib/validations/collection.schema";
import type { Collection } from "@/types/collection";

interface RouteContext {
  params: Promise<{ collectionId: string }>;
}

async function findCollectionRow(collectionId: string) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: COLLECTIONS_SHEET_RANGE,
  });

  const rows = response.data.values ?? [];
  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && String(row[0] ?? "") === collectionId,
  );

  if (rowIndex === -1) {
    return null;
  }

  const row = rows[rowIndex];

  const collection: Collection = {
    collectionId: String(row[0] ?? ""),
    memberId: String(row[1] ?? ""),
    amount: Number(row[2] ?? 0),
    donationDate: String(row[3] ?? ""),
    recordStatus: row[4] === "Cancelled" ? "Cancelled" : "Active",
    note: String(row[5] ?? ""),
    createdAt: String(row[6] ?? ""),
    updatedAt: String(row[7] ?? ""),
    paymentType: row[8] === "Yearly" ? "Yearly" : "Monthly",
    paymentGroupId: String(row[9] ?? ""),
    paymentReceivedDate: String(row[10] ?? String(row[3] ?? "")),
  };

  return {
    sheets,
    spreadsheetId,
    rowNumber: rowIndex + 1,
    collection,
  };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const { collectionId } = await params;
    const body: unknown = await request.json();
    const validation = updateCollectionSchema.safeParse(body);

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

    const result = await findCollectionRow(collectionId);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Collection record not found." },
        { status: 404 },
      );
    }

    if (result.collection.recordStatus === "Cancelled") {
      return NextResponse.json(
        { success: false, message: "Cancelled collections cannot be edited." },
        { status: 409 },
      );
    }

    const updatedCollection: Collection = {
      ...result.collection,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    await result.sheets.spreadsheets.values.update({
      spreadsheetId: result.spreadsheetId,
      range: `Collections!A${result.rowNumber}:K${result.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            updatedCollection.collectionId,
            updatedCollection.memberId,
            updatedCollection.amount,
            updatedCollection.donationDate,
            updatedCollection.recordStatus,
            updatedCollection.note,
            updatedCollection.createdAt,
            updatedCollection.updatedAt,
            updatedCollection.paymentType,
            updatedCollection.paymentGroupId,
            updatedCollection.paymentReceivedDate,
          ],
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collection updated successfully.",
      collection: updatedCollection,
    });
  } catch (error) {
    console.error("Update collection error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update collection." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    const { collectionId } = await params;
    const result = await findCollectionRow(collectionId);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Collection record not found." },
        { status: 404 },
      );
    }

    if (result.collection.recordStatus === "Cancelled") {
      return NextResponse.json(
        { success: false, message: "Collection is already cancelled." },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    const cancelledCollection: Collection = {
      ...result.collection,
      recordStatus: "Cancelled",
      updatedAt: now,
    };

    await result.sheets.spreadsheets.values.update({
      spreadsheetId: result.spreadsheetId,
      range: `Collections!A${result.rowNumber}:K${result.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            cancelledCollection.collectionId,
            cancelledCollection.memberId,
            cancelledCollection.amount,
            cancelledCollection.donationDate,
            cancelledCollection.recordStatus,
            cancelledCollection.note,
            cancelledCollection.createdAt,
            cancelledCollection.updatedAt,
            cancelledCollection.paymentType,
            cancelledCollection.paymentGroupId,
            cancelledCollection.paymentReceivedDate,
          ],
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collection cancelled successfully.",
      collection: cancelledCollection,
    });
  } catch (error) {
    console.error("Cancel collection error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to cancel collection." },
      { status: 500 },
    );
  }
}
