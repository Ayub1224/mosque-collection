
import { NextResponse } from "next/server";
import { auth, isAdminEmail } from "@/auth";
import {
  COLLECTIONS_SHEET_RANGE,
  MEMBERS_SHEET_RANGE,
  getGoogleSheetsClient,
  getSpreadsheetId,
} from "@/lib/google-sheets";

interface LegacyCollectionRow {
  rowNumber: number;
  collectionId: string;
  memberId: string;
  memberName: string;
  amount: number;
  donationDate: string;
  recordStatus: "Active" | "Cancelled";
  note: string;
  createdAt: string;
  updatedAt: string;
  paymentType: "Monthly" | "Yearly";
  paymentGroupId: string;
  paymentReceivedDate: string;
}

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

    // Read both existing sheets. This endpoint never writes data.
    const [collectionsResponse, membersResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: COLLECTIONS_SHEET_RANGE,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: MEMBERS_SHEET_RANGE,
      }),
    ]);

    const collectionRows = collectionsResponse.data.values ?? [];
    const memberRows = membersResponse.data.values ?? [];

    const memberNames = new Map<string, string>();

    memberRows.slice(1).forEach((row) => {
      const memberId = String(row[0] ?? "");
      const fullName = String(row[1] ?? "");

      if (memberId) {
        memberNames.set(memberId, fullName);
      }
    });

    const sourceRows: LegacyCollectionRow[] = collectionRows
      .slice(1)
      .map((row, index): LegacyCollectionRow => {
        const memberId = String(row[1] ?? "");
        const donationDate = String(row[3] ?? "");

        return {
          rowNumber: index + 2,
          collectionId: String(row[0] ?? ""),
          memberId,
          memberName: memberNames.get(memberId) ?? "",
          amount: Number(row[2] ?? 0),
          donationDate,
          recordStatus:
            row[4] === "Cancelled" ? "Cancelled" : "Active",
          note: String(row[5] ?? ""),
          createdAt: String(row[6] ?? ""),
          updatedAt: String(row[7] ?? ""),
          paymentType: row[8] === "Yearly" ? "Yearly" : "Monthly",
          paymentGroupId: String(row[9] ?? ""),
          paymentReceivedDate: String(row[10] ?? donationDate),
        };
      })
      .filter((row) => row.collectionId || row.memberId);

    const payments = [];
    const allocations = [];
    const warnings: string[] = [];

    const yearlyGroups = new Map<string, LegacyCollectionRow[]>();
    const monthlyRows: LegacyCollectionRow[] = [];

    for (const row of sourceRows) {
      if (!row.memberId) {
        warnings.push(
          `Collections row ${row.rowNumber}: Missing member ID.`,
        );
        continue;
      }

      if (!row.memberName) {
        warnings.push(
          `Collections row ${row.rowNumber}: Member "${row.memberId}" was not found in Members.`,
        );
        continue;
      }

      if (!Number.isFinite(row.amount) || row.amount <= 0) {
        warnings.push(
          `Collections row ${row.rowNumber}: Invalid amount.`,
        );
        continue;
      }

      if (row.paymentType === "Yearly") {
        if (!row.paymentGroupId) {
          warnings.push(
            `Collections row ${row.rowNumber}: Yearly payment has no paymentGroupId.`,
          );
          continue;
        }

        const group = yearlyGroups.get(row.paymentGroupId) ?? [];
        group.push(row);
        yearlyGroups.set(row.paymentGroupId, group);
      } else {
        monthlyRows.push(row);
      }
    }

    // Each ordinary monthly collection becomes one payment and one allocation.
    for (const row of monthlyRows) {
      const paymentId = `PAY-${row.collectionId}`;

      payments.push({
        paymentId,
        memberId: row.memberId,
        memberName: row.memberName,
        totalAmount: row.amount,
        paymentType: "Monthly" as const,
        paymentReceivedDate: row.paymentReceivedDate,
        note: row.note,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });

      allocations.push({
        allocationId: row.collectionId,
        paymentId,
        memberId: row.memberId,
        memberName: row.memberName,
        amount: row.amount,
        allocationDate: row.donationDate,
        recordStatus: row.recordStatus,
        note: row.note,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    // Each yearly group becomes one payment and its monthly allocations.
    for (const [paymentGroupId, group] of yearlyGroups) {
      const first = group[0];

      const inconsistentMember = group.some(
        (row) => row.memberId !== first.memberId,
      );

      const inconsistentReceivedDate = group.some(
        (row) => row.paymentReceivedDate !== first.paymentReceivedDate,
      );

      const duplicateAllocationDates =
        new Set(group.map((row) => row.donationDate)).size !== group.length;

      if (group.length !== 12) {
        warnings.push(
          `Yearly payment ${paymentGroupId}: Expected 12 allocations, found ${group.length}.`,
        );
      }

      if (inconsistentMember) {
        warnings.push(
          `Yearly payment ${paymentGroupId}: Contains multiple member IDs.`,
        );
        continue;
      }

      if (inconsistentReceivedDate) {
        warnings.push(
          `Yearly payment ${paymentGroupId}: Contains multiple payment received dates.`,
        );
        continue;
      }

      if (duplicateAllocationDates) {
        warnings.push(
          `Yearly payment ${paymentGroupId}: Contains duplicate allocation dates.`,
        );
        continue;
      }

      payments.push({
        paymentId: paymentGroupId,
        memberId: first.memberId,
        memberName: first.memberName,
        totalAmount: group.reduce((total, row) => total + row.amount, 0),
        paymentType: "Yearly" as const,
        paymentReceivedDate: first.paymentReceivedDate,
        note: first.note,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt,
      });

      for (const row of group) {
        allocations.push({
          allocationId: row.collectionId,
          paymentId: paymentGroupId,
          memberId: row.memberId,
          memberName: row.memberName,
          amount: row.amount,
          allocationDate: row.donationDate,
          recordStatus: row.recordStatus,
          note: row.note,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      readOnly: true,
      summary: {
        sourceCollectionRows: sourceRows.length,
        paymentsToCreate: payments.length,
        allocationsToCreate: allocations.length,
        monthlyPayments: payments.filter(
          (payment) => payment.paymentType === "Monthly",
        ).length,
        yearlyPayments: payments.filter(
          (payment) => payment.paymentType === "Yearly",
        ).length,
        activeAllocations: allocations.filter(
          (allocation) => allocation.recordStatus === "Active",
        ).length,
        cancelledAllocations: allocations.filter(
          (allocation) => allocation.recordStatus === "Cancelled",
        ).length,
        warningCount: warnings.length,
      },
      warnings,
      payments,
      allocations,
    });
  } catch (error) {
    console.error("Migration preview error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate migration preview.",
      },
      { status: 500 },
    );
  }
}
