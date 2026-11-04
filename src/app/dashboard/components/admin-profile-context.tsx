"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import en from "@/i18n/translations/en";
import hi from "@/i18n/translations/hi";
import type { Language } from "@/i18n/language-config";

type Dictionary = typeof en;
type TranslationKey = { [K in keyof Dictionary]: `${K & string}.${keyof Dictionary[K] & string}` }[keyof Dictionary];
type ContextValue = { adminName: string; language: Language; languageSaving: boolean; t: (key: TranslationKey) => string; updateLanguage: (language: Language) => Promise<boolean> };
const Context = createContext<ContextValue | null>(null);
function translate(dictionary: Dictionary, key: TranslationKey): string {
  const [group, item] = key.split(".") as [keyof Dictionary, string];
  return (dictionary[group] as Record<string, string>)[item] ?? (en[group] as Record<string, string>)[item] ?? key;
}
export function AdminProfileProvider({ children, adminName, initialLanguage }: { children: React.ReactNode; adminName: string; initialLanguage: Language }) {
  const [language, setLanguage] = useState(initialLanguage);
  const [languageSaving, setLanguageSaving] = useState(false);
  const t = useCallback((key: TranslationKey) => translate(language === "hi" ? hi : en, key), [language]);
  const updateLanguage = useCallback(async (next: Language) => {
    if (languageSaving) return false;
    setLanguageSaving(true);
    try {
      const response = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: next }) });
      if (!response.ok) return false;
      setLanguage(next);
      return true;
    } catch { return false; } finally { setLanguageSaving(false); }
  }, [languageSaving]);
  const value = useMemo(() => ({ adminName, language, languageSaving, t, updateLanguage }), [adminName, language, languageSaving, t, updateLanguage]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLanguage() { const value = useContext(Context); if (!value) throw new Error("useLanguage must be used within AdminProfileProvider"); return value; }
export function useAdminName() { return useLanguage().adminName; }
