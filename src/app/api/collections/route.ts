
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, isAdminEmail } from "@/auth";
import {
  MEMBERS_SHEET_RANGE,
  PAYMENTS_SHEET_RANGE,
  MONTHLY_ALLOCATIONS_SHEET_RANGE,
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

    const [paymentsResponse, allocationsResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: PAYMENTS_SHEET_RANGE,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: MONTHLY_ALLOCATIONS_SHEET_RANGE,
      }),
    ]);

    const paymentRows = paymentsResponse.data.values ?? [];
    const allocationRows = allocationsResponse.data.values ?? [];

    const collections: Collection[] = allocationRows
      .slice(1)
      .map((row) => {
        const paymentId = String(row[1] ?? "");
        const payment = paymentRows
          .slice(1)
          .find((paymentRow) => String(paymentRow[0] ?? "") === paymentId);

        const paymentType =
          payment?.[4] === "Yearly" ? "Yearly" : "Monthly";

        return {
          collectionId: String(row[0] ?? ""),
          memberId: String(row[2] ?? ""),
          amount: Number(row[4] ?? 0),
          donationDate: String(row[5] ?? ""),
          recordStatus:
            row[6] === "Cancelled" ? "Cancelled" : "Active",
          note: String(row[7] ?? ""),
          createdAt: String(row[8] ?? ""),
          updatedAt: String(row[9] ?? ""),
          paymentType,
          paymentGroupId: paymentType === "Yearly" ? paymentId : "",
          paymentReceivedDate: String(payment?.[5] ?? row[5] ?? ""),
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

    // Verify that the selected member exists and retrieve their name.
    const membersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MEMBERS_SHEET_RANGE,
    });

    const memberRows = membersResponse.data.values ?? [];

    const memberRow = memberRows
      .slice(1)
      .find((row) => String(row[0] ?? "") === values.memberId);

    if (!memberRow) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected member does not exist.",
        },
        { status: 404 },
      );
    }

    const memberName = String(memberRow[1] ?? "");
    const now = new Date().toISOString();
    const isYearlyPayment = values.isYearlyPayment;
    const paymentId = `PAY-${randomUUID()}`;
    const paymentType = isYearlyPayment ? "Yearly" : "Monthly";

    let allocationDates: string[];

    if (isYearlyPayment) {
      const [receivedYear, receivedMonth] = values.donationDate
        .split("-")
        .map(Number);

      // Indian financial year: April to March.
      const financialYearStart =
        receivedMonth >= 4 ? receivedYear : receivedYear - 1;

      allocationDates = Array.from({ length: 12 }, (_, index) =>
        new Date(Date.UTC(financialYearStart, 3 + index, 1))
          .toISOString()
          .slice(0, 10),
      );
    } else {
      allocationDates = [values.donationDate];
    }

    const allocationAmount = isYearlyPayment
      ? values.amount / 12
      : values.amount;

    const collections: Collection[] = allocationDates.map(
      (allocationDate) => ({
        collectionId: `COL-${randomUUID()}`,
        memberId: values.memberId,
        amount: allocationAmount,
        donationDate: allocationDate,
        recordStatus: "Active",
        note: values.note,
        createdAt: now,
        updatedAt: now,
        paymentType,
        paymentGroupId: isYearlyPayment ? paymentId : "",
        paymentReceivedDate: values.donationDate,
      }),
    );

    // Determine the next available rows in both sheets.
    const [paymentsResponse, allocationsResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: PAYMENTS_SHEET_RANGE,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: MONTHLY_ALLOCATIONS_SHEET_RANGE,
      }),
    ]);

    const paymentStartRow = Math.max(
      2,
      (paymentsResponse.data.values?.length ?? 1) + 1,
    );

    const allocationStartRow = Math.max(
      2,
      (allocationsResponse.data.values?.length ?? 1) + 1,
    );

    // Write the payment and its allocations in one batch request.
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          {
            range: `Payments!A${paymentStartRow}:I${paymentStartRow}`,
            values: [
              [
                paymentId,
                values.memberId,
                memberName,
                values.amount,
                paymentType,
                values.donationDate,
                values.note,
                now,
                now,
              ],
            ],
          },
          {
            range: `MonthlyAllocations!A${allocationStartRow}:J${allocationStartRow + collections.length - 1}`,
            values: collections.map((collection) => [
              collection.collectionId,
              paymentId,
              collection.memberId,
              memberName,
              collection.amount,
              collection.donationDate,
              collection.recordStatus,
              collection.note,
              collection.createdAt,
              collection.updatedAt,
            ]),
          },
        ],
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
