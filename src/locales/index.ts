import { en } from "./en";
import { ptBR } from "./pt-br";
import { zh } from "./zh";
import { ru } from "./ru";
import { ja } from "./ja";
import { ko } from "./ko";

/** Available Language Keys */
export type TLocaleKey = 'en' | 'ja' | 'ko' | 'ptBR' | 'ru' | 'zh';

/** Recursively converts all leaves of T to strings.
* Maintains the same key structure, but normalizes the values. */
type TLeavesToString<T> = T extends string
  ? string
  : { [K in keyof T]: TLeavesToString<T[K]> };

/** Generates paths of type "a.b.c" from a nested object.
* Returns a union of strings containing all paths up to the leaves. */
type TNestedPaths<T> = {
  [K in keyof T & string]: T[K] extends object
  ? `${K}.${TNestedPaths<T[K]>}`
  : K;
}[keyof T & string];

/** Base Schema (structure) derived from pt - just keys/strings. */
export type TTranslationSchema = TLeavesToString<typeof ptBR>;

/** Every possible key as a string chain: "a.b.c" */
export type TTranslationKeys = TNestedPaths<TTranslationSchema>;

/** LocaleData: translation schema + friendly label */
export type TLocaleData = TTranslationSchema & { label: string };

/** Locales Dictionary */
export const locales: Record<TLocaleKey, TLocaleData> = {
  en: { ...en, label: "English" },
  ptBR: { ...ptBR, label: "Português Brasileiro" },
  zh: { ...zh, label: "简体中文" },
  ru: { ...ru, label: "Русский" },
  ja: { ...ja, label: "日本語" },
  ko: { ...ko, label: "한국어" },
};
