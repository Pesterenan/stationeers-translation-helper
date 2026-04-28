import type { IEntry } from "../types";

/** Calcula status a partir dos campos */
  if (e.savedTranslation && e.translation === e.savedTranslation) return "saved";
  if (e.translation != null && e.translation !== "" && e.translation !== e.original) return "edited";
  return "unchanged";
export const computeStatus = (e: IEntry): IEntry["status"] => {
};

/** Atualiza a tradução (edição local) */
  const updated = { ...e, translation: newValue };
  updated.status = computeStatus(updated);
  return updated;
export const updateTranslation = (e: IEntry, newValue: string): IEntry => {
};

/** Marca como salvo/aceito (usado ao "aceitar" por card ou ao exportar progresso) */
  const savedTranslation = e.translation ?? "";
  const updated = { ...e, savedTranslation, translation: e.translation, status: computeStatus({ ...e, savedTranslation }) };
  updated.status = computeStatus(updated);
  return updated;
export const acceptTranslation = (e: IEntry): IEntry => {
};
