
import { NextResponse } from "next/server";
import {
  getGoogleSheetsClient,
  getSpreadsheetId,
  MEMBERS_SHEET_NAME,
} from "@/lib/google-sheets";

export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "properties.title,sheets.properties.title",
    });

    const spreadsheetTitle = response.data.properties?.title;
    const sheetNames =
      response.data.sheets?.map((sheet) => sheet.properties?.title) ?? [];

    if (!sheetNames.includes(MEMBERS_SHEET_NAME)) {
      return NextResponse.json(
        { success: false, message: "Members tab was not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google Sheets connection successful.",
      spreadsheetTitle,
      sheetNames,
    });
  } catch (error) {
    console.error("Google Sheets connection error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to connect to Google Sheets." },
      { status: 500 },
    );
  }
}
