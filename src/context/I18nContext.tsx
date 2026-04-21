import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { locales } from "../locales";
import type { LocaleKey, TranslationKeys } from "../locales";

interface I18nContextType {
  locale: LocaleKey;
  t: (path: TranslationKeys, params?: Record<string, string>) => string;
  changeLanguage: (lang: LocaleKey) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const detectLanguage = (): LocaleKey => {
    const saved = localStorage.getItem("sth_ui_lang") as LocaleKey | null;
    if (saved && locales[saved]) return saved;

    const sysLang = (navigator.language || 'en').split("-")[0] as LocaleKey;
    return locales[sysLang] ? sysLang : "en";
  };

  const [locale, setLocale] = useState<LocaleKey>(detectLanguage());

  const t = useCallback((path: TranslationKeys, params?: Record<string, string>): string => {
    const dictionary = locales[locale] as any;
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

  const changeLanguage = useCallback((lang: LocaleKey) => {
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

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
