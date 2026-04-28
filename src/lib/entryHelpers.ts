import type { IEntry } from "../types";

// Helper to determine entry status based on translation and original text
export const computeStatus = (e: IEntry): IEntry["status"] => {
  if (!e.translation || e.translation.trim() === "") {
    return "unchanged";
  }

  // If we have a translation but it hasn't been "accepted" (saved)
  if (e.translation !== e.savedTranslation) {
    return "edited";
  }

  return "saved";
};

export const updateTranslation = (e: IEntry, newValue: string): IEntry => {
  const nextTranslation = newValue.trim() === "" ? undefined : newValue;
  const nextStatus = nextTranslation === e.savedTranslation ? (nextTranslation ? "saved" : "unchanged") : "edited";

  return {
    ...e,
    translation: nextTranslation,
    status: nextStatus,
  };
};

export const acceptTranslation = (e: IEntry): IEntry => {
  if (!e.translation) return e;

  return {
    ...e,
    savedTranslation: e.translation,
    originalAtTranslation: e.original,
    status: "saved",
  };
};
