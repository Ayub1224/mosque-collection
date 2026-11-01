import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, isAdminEmail } from "@/auth";
import {
  getGoogleSheetsClient,
  getSpreadsheetId,
} from "@/lib/google-sheets";

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

const statusSchema = z.object({
  status: z.enum(["Active", "Inactive"]),
});

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    // Verify admin access
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    // Validate request body
    const body: unknown = await request.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member status.",
          errors: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const { memberId } = await params;
    const { status } = validation.data;

    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    // Find member
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Members!A:H",
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

    // Update status while preserving all other member data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Members!F${rowNumber}:H${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          status,
          existingRow[6] ?? "",
          now,
        ]],
      },
    });

    return NextResponse.json({
      success: true,
      message: `Member ${status === "Active" ? "activated" : "deactivated"} successfully.`,
    });
  } catch (error) {
    console.error("Update member status error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update member status." },
      { status: 500 },
    );
  }
}