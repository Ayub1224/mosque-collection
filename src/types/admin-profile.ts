export type AdminLanguage = "en";

export type AdminTheme = "blue";

export interface AdminProfile {
  email: string;
  name: string;
  designation: string;
  language: AdminLanguage;
  theme: AdminTheme;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}