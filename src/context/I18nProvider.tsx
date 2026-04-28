import { useState, useCallback, type ReactNode } from "react";
import { locales } from "../locales";
import type { TLocaleKey, TTranslationKeys } from "../locales";
import { I18nContext } from "./useI18nContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const detectLanguage = (): TLocaleKey => {
    const saved = localStorage.getItem("sth_ui_lang") as TLocaleKey | null;
    if (saved && locales[saved]) return saved;

    const sysLang = (navigator.language || 'en').split("-")[0] as TLocaleKey;
    return locales[sysLang] ? sysLang : "en";
  };

  const [locale, setLocale] = useState<TLocaleKey>(detectLanguage());

  const t = useCallback((path: TTranslationKeys, params?: Record<string, string>): string => {
    const dictionary = locales[locale];
    let value = getNestedValue(dictionary, path);

    if (value === undefined) {
      // Fallback to English
      value = getNestedValue(locales.en, path) || path;
    }

    if (params && typeof value === "string") {
      Object.entries(params).forEach(([key, val]) => {
        value = (value as string).replace(`{${key}}`, val);
      });
    }

    return value as string;
  }, [locale]);

  const changeLanguage = useCallback((lang: TLocaleKey) => {
    if (locales[lang]) {
      setLocale(lang);
      localStorage.setItem("sth_ui_lang", lang);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}
