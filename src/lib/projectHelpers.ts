import type { IEntry, IMetadata } from "../types";

/**
 * Resolves final metadata by merging parsed XML metadata with existing project state.
 */
export const resolveFinalMetadata = (
  xmlMeta: IMetadata,
  currentMeta: IMetadata | null,
  fileName?: string
): IMetadata => {
  return {
    Language: currentMeta?.Language || xmlMeta.Language,
    Code: currentMeta?.Code || xmlMeta.Code,
    Font: currentMeta?.Font || xmlMeta.Font,
    ExportFileName: currentMeta?.ExportFileName,
    OriginalFileName: fileName || currentMeta?.OriginalFileName || xmlMeta.OriginalFileName,
  };
};

/**
 * Initializes entries by merging parsed XML entries with saved draft translations.
 */
export const initializeEntriesWithDraft = (
  parsedEntries: IEntry[],
  savedDraft: any
): IEntry[] => {
  const draftTranslations: Record<string, string | { translation: string, original: string }> = savedDraft?.translations || {};

  return parsedEntries.map((e) => {
    const combinedKey = `${e.section}|${e.key}`;
    const draftEntry = draftTranslations[combinedKey];

    let savedValue: string | undefined;
    let prevOriginal: string | undefined;

    if (draftEntry) {
      savedValue = typeof draftEntry === 'string' ? draftEntry : draftEntry.translation;
      prevOriginal = typeof draftEntry === 'string' ? undefined : draftEntry.original;
    }

    const hasChanged = prevOriginal !== undefined && prevOriginal !== e.original;

    return {
      ...e,
      savedTranslation: savedValue,
      translation: savedValue || undefined,
      status: hasChanged ? ("edited" as const) : (savedValue ? ("saved" as const) : ("unchanged" as const)),
      originalAtTranslation: prevOriginal || (savedValue ? e.original : undefined),
    };
  });
};
