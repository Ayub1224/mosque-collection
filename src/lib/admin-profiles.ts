
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
    profileCompleted: String(row[5]).toLowerCase() === "true",
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

  const profile = mapRowToProfile(matchingRow);

  // Preserve saved preferences when reading the profile.
  const language = String(matchingRow[3] ?? "en");
  const theme = String(matchingRow[4] ?? "blue");

  return {
    ...profile,
    language: language === "en" ? "en" : "en",
    theme: theme === "blue" ? "blue" : "blue",
  };
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

  const createdAt = String(existingRow?.[6] ?? now);
  const language = String(existingRow?.[3] ?? "en");
  const theme = String(existingRow?.[4] ?? "blue");

  const profile: AdminProfile = {
    email: normalizedEmail,
    name: name.trim(),
    designation: designation.trim(),
    language: language === "en" ? "en" : "en",
    theme: theme === "blue" ? "blue" : "blue",
    profileCompleted: true,
    createdAt,
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

  if (existingRowIndex > 0) {
    // Update the existing admin profile.
    const sheetRowNumber = existingRowIndex + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ADMIN_PROFILES_SHEET_NAME}!A${sheetRowNumber}:H${sheetRowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } else {
    // Insert a new admin profile.
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: ADMIN_PROFILES_SHEET_RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
  }

  return profile;
}
