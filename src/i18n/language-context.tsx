"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import en from "./translations/en";
import hi from "./translations/hi";
import type { Language } from "./language-config";

type Dictionary = typeof en;
type TranslationKey = { [K in keyof Dictionary]: `${K & string}.${keyof Dictionary[K] & string}` }[keyof Dictionary];
type ContextValue = { adminName: string; language: Language; t: (key: TranslationKey) => string; updateLanguage: (language: Language) => Promise<boolean> };
const Context = createContext<ContextValue | null>(null);
function translate(dictionary: Dictionary, key: TranslationKey): string {
  const [group, item] = key.split(".") as [keyof Dictionary, string];
  return (dictionary[group] as Record<string, string>)[item] ?? (en[group] as Record<string, string>)[item] ?? key;
}
export function AdminProfileProvider({ children, adminName, initialLanguage }: { children: React.ReactNode; adminName: string; initialLanguage: Language }) {
  const [language, setLanguage] = useState(initialLanguage);
  const t = useCallback((key: TranslationKey) => translate(language === "hi" ? hi : en, key), [language]);
  const updateLanguage = useCallback(async (next: Language) => {
    try {
      const response = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: next }) });
      if (!response.ok) return false;
      setLanguage(next);
      return true;
    } catch { return false; }
  }, []);
  const value = useMemo(() => ({ adminName, language, t, updateLanguage }), [adminName, language, t, updateLanguage]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLanguage() { const value = useContext(Context); if (!value) throw new Error("useLanguage must be used within AdminProfileProvider"); return value; }
