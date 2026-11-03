
import "server-only";

import {
  ADMIN_PROFILES_SHEET_NAME,
  ADMIN_PROFILES_SHEET_RANGE,
  getGoogleSheetsClient,
  getSpreadsheetId,
} from "@/lib/google-sheets";
import type { AdminProfile } from "@/types/admin-profile";

type SaveAdminProfileInput = {
  email: string;
  name: string;
  designation: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapRowToProfile(row: string[]): AdminProfile {
  return {
    email: String(row[0] ?? ""),
    name: String(row[1] ?? ""),
    designation: String(row[2] ?? ""),
    language: "en",
    theme: "blue",
    profileCompleted: String(row[5] ?? "").toLowerCase() === "true",
    createdAt: String(row[6] ?? ""),
    updatedAt: String(row[7] ?? ""),
  };
}

export async function getAdminProfileByEmail(
  email: string,
): Promise<AdminProfile | null> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: ADMIN_PROFILES_SHEET_RANGE,
  });

  const rows = response.data.values ?? [];
  const normalizedEmail = normalizeEmail(email);

  const matchingRow = rows.slice(1).find(
    (row) => normalizeEmail(String(row[0] ?? "")) === normalizedEmail,
  );

  if (!matchingRow) {
    return null;
  }

  return mapRowToProfile(matchingRow);
}

export async function saveAdminProfile({
  email,
  name,
  designation,
}: SaveAdminProfileInput): Promise<AdminProfile> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const normalizedEmail = normalizeEmail(email);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: ADMIN_PROFILES_SHEET_RANGE,
  });

  const rows = response.data.values ?? [];

  const existingRowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      normalizeEmail(String(row[0] ?? "")) === normalizedEmail,
  );

  const now = new Date().toISOString();

  const existingRow =
    existingRowIndex > 0 ? rows[existingRowIndex] : undefined;

  const profile: AdminProfile = {
    email: normalizedEmail,
    name: name.trim(),
    designation: designation.trim(),
    language: "en",
    theme: "blue",
    profileCompleted: true,
    createdAt: String(existingRow?.[6] ?? now),
    updatedAt: now,
  };

  const values = [[
    profile.email,
    profile.name,
    profile.designation,
    profile.language,
    profile.theme,
    profile.profileCompleted,
    profile.createdAt,
    profile.updatedAt,
  ]];

  // Update an existing profile or write to the next available row.
  const sheetRowNumber =
    existingRowIndex > 0 ? existingRowIndex + 1 : rows.length + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${ADMIN_PROFILES_SHEET_NAME}!A${sheetRowNumber}:H${sheetRowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });

  return profile;
}
