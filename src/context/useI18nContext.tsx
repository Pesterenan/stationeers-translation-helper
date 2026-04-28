
import { createContext, useContext } from "react";
import type { TLocaleKey, TTranslationKeys } from "../locales";

interface II18nContext {
  locale: TLocaleKey;
  t: (path: TTranslationKeys, params?: Record<string, string>) => string;
  changeLanguage: (lang: TLocaleKey) => void;
}

export const I18nContext = createContext<II18nContext | undefined>(undefined);

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
