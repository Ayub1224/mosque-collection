export type Language = "en" | "hi";
export function normalizeLanguage(value: unknown): Language { return value === "hi" ? "hi" : "en"; }
