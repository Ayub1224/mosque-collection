
import "server-only";

import { google } from "googleapis";

export const MEMBERS_SHEET_NAME = "Members";
export const MEMBERS_SHEET_RANGE = `${MEMBERS_SHEET_NAME}!A:H`;
export const COLLECTIONS_SHEET_NAME = "Collections";
export const COLLECTIONS_SHEET_RANGE = `${COLLECTIONS_SHEET_NAME}!A:H`;
export const ADMIN_PROFILES_SHEET_NAME = "AdminProfiles";
export const ADMIN_PROFILES_SHEET_RANGE = `${ADMIN_PROFILES_SHEET_NAME}!A:H`;

export function getSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is missing.");
  }

  return spreadsheetId;
}

export function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credentials are missing.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({
    version: "v4",
    auth,
  });
}
