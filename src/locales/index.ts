import { en } from "./en";
import { pt } from "./pt";
import { zh } from "./zh";
import { ru } from "./ru";
import { ja } from "./ja";
import { ko } from "./ko";

/** Chaves de idioma disponíveis */
export type LocaleKey = 'en' | 'pt' | 'zh' | 'ru' | 'ja' | 'ko';

/**
 * Converte recursivamente todas as folhas de T para string.
 * Mantém a mesma estrutura de chaves, mas normaliza os valores.
 */
type LeavesToString<T> = T extends string
  ? string
  : { [K in keyof T]: LeavesToString<T[K]> };

/**
 * Gera paths do tipo "a.b.c" a partir de um objeto aninhado.
 * Retorna união de strings com todos os caminhos até as folhas.
 */
type NestedPaths<T> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${NestedPaths<T[K]>}`
    : K;
}[keyof T & string];

/** Schema base (estrutura) derivada do en — apenas as chaves/strings */
export type TranslationSchema = LeavesToString<typeof en>;

/** Todas as chaves possíveis como união de strings "a.b.c" */
export type TranslationKeys = NestedPaths<TranslationSchema>;

/** Tipo do objeto de cada locale: schema de traduções + label amigável */
export type LocaleData = TranslationSchema & { label: string };

/** Objeto com todos os dicionários (cada um precisa seguir a estrutura de TranslationSchema e ter label) */
export const locales: Record<LocaleKey, LocaleData> = {
  en: { ...en, label: "English" },
  pt: { ...pt, label: "Português" },
  zh: { ...zh, label: "简体中文" },
  ru: { ...ru, label: "Русский" },
  ja: { ...ja, label: "日本語" },
  ko: { ...ko, label: "한국어" },
};
