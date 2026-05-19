import { STORAGE_KEYS } from "../constants";

/** Generates a draft key to be saved in localStorage
* @param {string} lang The language of the draft 
* @param {string} code The two letter code for the language in-game
* */
export const generateDraftKey = (lang?: string, code?: string, fileName?: string) => {
  const l = lang?.toLowerCase().replace(/\s+/g, "-").trim() || "unknown";
  const c = code?.toLowerCase().replace(/\s+/g, "-").trim() || "";
  const suffix = c ? `${l}_${c}` : l;

  if (fileName) {
    const fn = fileName.toLowerCase().replace(/\s+/g, "-").replace(/\.xml$/, "").trim();
    return `${STORAGE_KEYS.DRAFT_PREFIX}_${fn}_${suffix}`;
  }

  return `${STORAGE_KEYS.DRAFT_PREFIX}_${suffix}`;
};

/** Generic helper to set item in localStorage as JSON */
export const setItemJSON = <T>(key: string, value: T | null): void => {
  if (value === null) {
    localStorage.removeItem(key);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[Persistence] Error saving JSON to key ${key}:`, error);
  }
};

/** Generic helper to get item from localStorage as JSON */
export const getItemJSON = <T>(key: string): T | null => {
  const value = localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Persistence] Error parsing JSON from key ${key}:`, error);
    return null;
  }
};

/** Helper to set simple string in localStorage */
export const setItemString = (key: string, value: string | null): void => {
  if (value === null) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, value);
};

/** Helper to get simple string from localStorage */
export const getItemString = (key: string): string | null => localStorage.getItem(key);
