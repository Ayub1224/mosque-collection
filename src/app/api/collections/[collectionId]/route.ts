import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, isAdminEmail } from "@/auth";
import {
  MONTHLY_ALLOCATIONS_SHEET_RANGE,
  PAYMENTS_SHEET_RANGE,
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

  const [allocationsResponse, paymentsResponse] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MONTHLY_ALLOCATIONS_SHEET_RANGE,
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: PAYMENTS_SHEET_RANGE,
    }),
  ]);

  const rows = allocationsResponse.data.values ?? [];
  const paymentRows = paymentsResponse.data.values ?? [];
  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && String(row[0] ?? "") === collectionId,
  );

  if (rowIndex === -1) {
    return null;
  }

  const row = rows[rowIndex];

  // MonthlyAllocations columns:
  // A allocationId, B paymentId, C memberId, D memberName,
  // E amount, F allocationDate, G recordStatus, H note,
  // I createdAt, J updatedAt.
  const paymentId = String(row[1] ?? "");
  const payment = paymentRows
    .slice(1)
    .find((paymentRow) => String(paymentRow[0] ?? "") === paymentId);
  const paymentType =
    payment?.[4] === "Yearly" ? "Yearly" : "Monthly";
  const collection: Collection = {
    collectionId: String(row[0] ?? ""),
    memberId: String(row[2] ?? ""),
    amount: Number(row[4] ?? 0),
    donationDate: String(row[5] ?? ""),
    recordStatus: row[6] === "Cancelled" ? "Cancelled" : "Active",
    note: String(row[7] ?? ""),
    createdAt: String(row[8] ?? ""),
    updatedAt: String(row[9] ?? ""),
    paymentType,
    paymentGroupId: paymentType === "Yearly" ? paymentId : "",
    paymentReceivedDate: String(payment?.[5] ?? row[5] ?? ""),
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
      range: `MonthlyAllocations!E${result.rowNumber}:J${result.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          updatedCollection.amount,
          updatedCollection.donationDate,
          updatedCollection.recordStatus,
          updatedCollection.note,
          updatedCollection.createdAt,
          updatedCollection.updatedAt,
        ]],
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

    // Cancel only this allocation. Keep the Payments row for audit history.
    await result.sheets.spreadsheets.values.update({
      spreadsheetId: result.spreadsheetId,
      range: `MonthlyAllocations!G${result.rowNumber}:J${result.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          cancelledCollection.recordStatus,
          cancelledCollection.note,
          cancelledCollection.createdAt,
          cancelledCollection.updatedAt,
        ]],
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
