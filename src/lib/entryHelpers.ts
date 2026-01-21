import type { Entry } from "../types";

/** Calcula status a partir dos campos */
export const computeStatus = (e: Entry): Entry["status"] => {
  if (e.savedTranslation && e.translation === e.savedTranslation) return "saved";
  if (e.translation != null && e.translation !== "" && e.translation !== e.original) return "edited";
  return "unchanged";
};

/** Atualiza a tradução (edição local) */
export const updateTranslation = (e: Entry, newValue: string): Entry => {
  const updated = { ...e, translation: newValue };
  updated.status = computeStatus(updated);
  return updated;
};

/** Marca como salvo/aceito (usado ao "aceitar" por card ou ao exportar progresso) */
export const acceptTranslation = (e: Entry): Entry => {
  const savedTranslation = e.translation ?? "";
  const updated = { ...e, savedTranslation, translation: e.translation, status: computeStatus({ ...e, savedTranslation }) };
  updated.status = computeStatus(updated);
  return updated;
};
