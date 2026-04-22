
import { createContext, useContext } from "react";
import type { LocaleKey, TranslationKeys } from "../locales";

interface I18nContextType {
  locale: LocaleKey;
  t: (path: TranslationKeys, params?: Record<string, string>) => string;
  changeLanguage: (lang: LocaleKey) => void;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
