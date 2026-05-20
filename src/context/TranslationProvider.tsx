import React, {
  useState,
  useMemo,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { type IEntry, type IMetadata } from "../types";
import {
  parseStationeersXml,
  buildTranslatedStationeersXml,
  updateMetadataInXml,
} from "../lib/xmlParser";
import { downloadFile } from "../lib/fileHelpers";
import {
  updateTranslation as updateTranslationHelper,
  acceptTranslation,
} from "../lib/entryHelpers";
import { resolveFinalMetadata, initializeEntriesWithDraft } from "../lib/projectHelpers";
import { TranslationContext } from "./useTranslationContext";
import { useI18nContext } from "./useI18nContext";
import { useDialogContext } from "./useDialogContext";
import { usePersistenceContext } from "./usePersistenceContext";
import { generateDraftKey } from "../lib/persistenceHelpers";

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { t } = useI18nContext();
  const { loadFileConfig, saveFileConfig, loadDraft, saveDraft } = usePersistenceContext();
  const { showAlert, showConfirm } = useDialogContext();

  const [metadata, setMetadata] = useState<IMetadata | null>(() => loadFileConfig());
  const [entries, setEntries] = useState<IEntry[]>([]);
  const [xmlDoc, setXmlDoc] = useState<XMLDocument | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [sourceVersion, setSourceVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAccepted, setShowAccepted] = useState<boolean>(true);
  const [showEmpty, setShowEmpty] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [regexError, setRegexError] = useState<string | null>(null);
  const [searchScope, setSearchScope] = useState<'original' | 'translated' | 'both'>('both');
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Validate RegEx and expose compiled regex for highlighting
  const { compiledRegex, regexError: validatedRegexError } = useMemo(() => {
    if (!useRegex || searchTerm.length === 0) {
      return { compiledRegex: null as RegExp | null, regexError: null as string | null };
    }
    try {
      const regex = new RegExp(searchTerm, 'gi');
      return { compiledRegex: regex, regexError: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid regular expression';
      return { compiledRegex: null, regexError: message };
    }
  }, [searchTerm, useRegex]);

  // Group entries by section (Memoized: only re-runs when entries change)
  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, IEntry[]>>((acc, entry) => {
      const key = entry.section;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [entries]);

  // Filter categories based on search term AND hideAccepted
  const categories = useMemo(() => {
    const isSearchActive = searchTerm.length > 2;
    const result: Record<string, IEntry[]> = {};

    Object.entries(groupedEntries).forEach(([section, sectionEntries]) => {
      const matches = sectionEntries.filter((entry) => {
        // First, check showAccepted
        if (!showAccepted && entry.status === "saved") {
          return false;
        }
        if (!showEmpty && entry.original.length === 0) {
          return false;
        }

        // Then, check search if active
        if (isSearchActive) {
          let matched = false;
          const lowerTerm = searchTerm.toLowerCase(); // Definir uma vez para eficiência

          const checkMatch = (text: string | undefined) => {
            if (!text) return false;
            return useRegex && compiledRegex
              ? compiledRegex.test(text)
              : text.toLowerCase().includes(lowerTerm);
          };

          switch (searchScope) {
            case 'original':
              matched = checkMatch(entry.key) || checkMatch(entry.original);
              break;
            case 'translated':
              matched = checkMatch(entry.translation) || checkMatch(entry.savedTranslation);
              break;
            case 'both':
            default:
              matched = checkMatch(entry.key) || checkMatch(entry.original) || checkMatch(entry.translation) || checkMatch(entry.savedTranslation);
              break;
          }
          return matched;
        }

        return true;
      });

      if (matches.length > 0) {
        result[section] = matches;
      }
    });

    return result;
  }, [searchTerm, groupedEntries, showAccepted, showEmpty, useRegex, compiledRegex, searchScope]);

  // Sync validated regex error to state
  useEffect(() => {
    setRegexError(validatedRegexError);
  }, [validatedRegexError]);

  // Pagination & Navigation
  const [page, setPage] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<string>("");

  const PAGE_SIZE = 30;

  // Filtragem para paginação
  const currentSectionEntries = React.useMemo(() => {
    return categories[activeSection] || [];
  }, [categories, activeSection]);

  const totalPages = Math.max(
    1,
    Math.ceil(currentSectionEntries.length / PAGE_SIZE),
  );
  const sections = useMemo(() => Object.keys(categories).sort(), [categories]);

  // Ensure activeSection is valid
  useEffect(() => {
    if (sections.length > 0 && !categories[activeSection]) {
      setActiveSection(sections[0]);
      setPage(1);
    } else if (sections.length === 0) {
      setActiveSection("");
    }
  }, [sections, activeSection, categories]);


  // Statistics
  const filteredEntriesForStats = useMemo(
    () => {
      if (showEmpty) return entries;
      return entries.filter((e) => e.original.trim().length > 0);
    },
    [entries, showEmpty],
  );

  const savedCount = useMemo(
    () => filteredEntriesForStats.filter((e) => e.status === "saved").length,
    [filteredEntriesForStats],
  );
  const total = filteredEntriesForStats.length;
  const percent = total === 0 ? 0 : Math.round((savedCount / total) * 100);

  // Auto-save logic
  useEffect(() => {
    if (entries.length === 0 || !metadata?.Language) return;

    const timeoutId = setTimeout(() => {
      const translations = entries.reduce<Record<string, string>>((acc, e) => {
        if (e.translation) {
          const key = `${e.section}|${e.key}`;
          acc[key] = e.translation;
        }
        return acc;
      }, {});

      const draftData = {
        metadata,
        translations,
        timestamp: new Date().toISOString(),
      };

      const storageKey = generateDraftKey(metadata.Language, metadata.Code, metadata.OriginalFileName);
      saveDraft(storageKey, draftData);
      setLastAutoSave(new Date());
    }, 3000); // Save after 3s of inactivity

    return () => clearTimeout(timeoutId);
  }, [entries, metadata, generateDraftKey]);

  // Actions
  const loadXml = useCallback((text: string, fileName?: string, version?: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const {
          entries: parsedEntries,
          xmlDocument,
          metadata: xmlMeta,
        } = parseStationeersXml(text);

        const finalMeta = resolveFinalMetadata(xmlMeta, metadata, fileName);

        // Debug draft recovery
        console.log("Tentando recuperar rascunho para:", finalMeta.Language, finalMeta.Code, finalMeta.OriginalFileName);

        const storageKey = generateDraftKey(finalMeta.Language || "", finalMeta.Code || "", finalMeta.OriginalFileName);
        const savedDraft = loadDraft(storageKey);

        console.log(t('messages.draftRecovered', { lang: finalMeta.Language || "" }));

        const initialized = initializeEntriesWithDraft(parsedEntries, savedDraft);

        const uniqueSections = Array.from(
          new Set(parsedEntries.map((e) => e.section)),
        ).sort();
        const firstSection = uniqueSections.length > 0 ? uniqueSections[0] : "";

        setEntries(initialized);
        setXmlDoc(xmlDocument);
        setMetadata(finalMeta);
        setOriginalFileName(fileName || "");
        setSourceVersion(version || null);
        setActiveSection(firstSection);
        setPage(1);
      } catch (err: unknown) {
        console.error(t('messages.xmlError'), err);
        const message = err instanceof Error ? err.message : String(err);
        await showAlert(t('app.title'), t('messages.xmlError') + " " + message);
      } finally {
        setIsLoading(false);
      }
    }, 600); // 600ms para aguardar animação da UI
  }, [metadata, t, showAlert, loadDraft]);


  // Load mock data on development
  const hasLoadedMock = React.useRef(false);
  useEffect(() => {
    if (hasLoadedMock.current) return;

    fetch("language_file_example.xml")
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error("Mock not found");
      })
      .then((text) => {
        hasLoadedMock.current = true;
        loadXml(text, "language_file_example.xml");
      })
      .catch(() => {
        // Silently ignore if mock is not available
      });
  }, [loadXml]);

  const loadProgressJson = useCallback((jsonText: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const obj = JSON.parse(jsonText);
        const translations: Record<string, string | { translation: string, original: string }> = obj.translations ?? {};

        if (obj.metadata) {
          setMetadata(obj.metadata);
        }

        setEntries((prev) =>
          prev.map((e) => {
            const combinedKey = `${e.section}|${e.key}`;
            const progressEntry = translations[combinedKey];

            if (progressEntry != null) {
              // Support both old and new formats
              const saved = typeof progressEntry === 'string' ? progressEntry : progressEntry.translation;
              const prevOriginal = typeof progressEntry === 'string' ? undefined : progressEntry.original;

              // Detect if original text changed
              const hasChanged = prevOriginal !== undefined && prevOriginal !== e.original;

              return {
                ...e,
                savedTranslation: saved,
                translation: saved,
                status: hasChanged ? ("edited" as const) : (saved ? ("saved" as const) : ("unchanged" as const)),
                originalAtTranslation: prevOriginal || (saved ? e.original : undefined)
              };
            }
            return e;
          }),
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(t('messages.jsonError'), err);
        await showAlert(
          t('app.title'),
          t('messages.jsonError') + " " + message,
        );
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, [t, showAlert]);

  const importTranslationsFromXml = useCallback((xmlText: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const { entries: importedEntries } = parseStationeersXml(xmlText);

        // Criar um mapa para busca rápida: "section|key" -> originalText (que é a tradução no arquivo importado)
        const translationMap = new Map<string, string>();
        importedEntries.forEach(e => {
          translationMap.set(`${e.section}|${e.key}`, e.original);
        });

        setEntries((prev) =>
          prev.map(e => {
            const key = `${e.section}|${e.key}`;
            const importedTranslation = translationMap.get(key);

            if (importedTranslation && importedTranslation.trim() !== "") {
              return {
                ...e,
                translation: importedTranslation,
                savedTranslation: importedTranslation,
                status: "saved" as const,
                originalAtTranslation: e.original
              };
            }
            return e;
          })
        );

        await showAlert(t('app.title'), t('messages.importSuccess'));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await showAlert(t('app.title'), t('messages.xmlError') + " " + message);
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, [t, showAlert]);

  const updateEntry = useCallback((id: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? updateTranslationHelper(e, value) : e)),
    );
  }, []);

  const acceptEntry = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? acceptTranslation(e) : e)),
    );
  }, []);

  const exportProgressJson = useCallback(() => {
    const translations = entries.reduce<Record<string, { translation: string, original: string }>>((acc, e) => {
      if (e.savedTranslation) {
        const exportKey = `${e.section}|${e.key}`;
        acc[exportKey] = {
          translation: e.savedTranslation,
          original: e.original // Save the original text to detect changes later
        };
      }
      return acc;
    }, {});

    const exportData = {
      metadata,
      sourceVersion,
      timestamp: new Date().toISOString(),
      translations,
    };

    let fileName = "translation-progress.json";
    if (originalFileName) {
      const parts = originalFileName.split(".");
      if (parts.length > 1) {
        parts.pop();
        fileName = `${parts.join(".")}_progress.json`;
      } else {
        fileName = `${originalFileName}_progress.json`;
      }
    } else {
      fileName = `${metadata?.Language?.toLowerCase().replace(/\s+/g, "-") || "stationeers"
        }-translation-progress.json`;
    }

    downloadFile(
      fileName,
      JSON.stringify(exportData, null, 2),
      "application/json;charset=utf-8",
    );
  }, [entries, metadata, originalFileName, sourceVersion]);

  const downloadTranslatedXml = useCallback(async () => {
    if (!xmlDoc) {
      await showAlert(t('app.title'), t('messages.noXml'));
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      try {
        let docToUse = xmlDoc;
        if (metadata) {
          const updatedXmlStr = updateMetadataInXml(xmlDoc, metadata);
          const { xmlDocument } = parseStationeersXml(updatedXmlStr);
          docToUse = xmlDocument;
        }
        const xml = buildTranslatedStationeersXml(docToUse, entries);

        let fileName = metadata?.ExportFileName || "translated.xml";
        if (!metadata?.ExportFileName) {
          if (originalFileName) {
            const parts = originalFileName.split(".");
            if (parts.length > 1) {
              parts.pop(); // Remove extension
              fileName = `${parts.join(".")}_translated.xml`;
            } else {
              fileName = `${originalFileName}_translated.xml`;
            }
          } else {
            const langName = metadata?.Language?.toLocaleLowerCase().replaceAll(
              / /g,
              "-",
            );
            if (langName) fileName = `${langName}.xml`;
          }
        }

        downloadFile(fileName, xml, "text/xml;charset=utf-8");
      } catch (err: unknown) {
        console.error(t('messages.exportError'), err);
        const message = err instanceof Error ? err.message : String(err);
        await showAlert(t('app.title'), t('messages.exportError') + " " + message);
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, [xmlDoc, metadata, entries, originalFileName, t, showAlert]);

  const changeTab = useCallback((newValue: string) => {
    setActiveSection(newValue);
    setPage(1);
  }, []);

  const resetProject = useCallback(async () => {
    if (await showConfirm(t('app.title'), t('messages.confirmReset'))) {
      setEntries([]);
      setXmlDoc(null);
      setMetadata(null);
      setOriginalFileName("");
      setSourceVersion(null);
      setPage(1);
      setActiveSection("");
    }
  }, [t, showConfirm]);

  // Sync metadata through PersistenceProvider
  useEffect(() => {
    saveFileConfig(metadata);
  }, [metadata, saveFileConfig]);

  const value = useMemo(
    () => ({
      acceptEntry,
      activeSection,
      categories,
      changeTab,
      downloadTranslatedXml,
      entries,
      exportProgressJson,
      importTranslationsFromXml,
      isLoading,
      lastAutoSave,
      loadProgressJson,
      loadXml,
      metadata,
      originalFileName,
      page,
      percent,
      resetProject,
      savedCount,
      searchTerm,
      searchScope,
      sections,
      setMetadata,
      setPage,
      setRegexError,
      setSearchScope,
      setSearchTerm,
      setShowAccepted,
      setShowEmpty,
      setUseRegex,
      showAccepted,
      showEmpty,
      useRegex,
      regexError,
      compiledRegex,
      sourceVersion,
      total,
      totalPages,
      updateEntry,
      xmlDoc,
    }),
    [
      acceptEntry,
      activeSection,
      categories,
      changeTab,
      downloadTranslatedXml,
      entries,
      exportProgressJson,
      importTranslationsFromXml,
      isLoading,
      lastAutoSave,
      loadProgressJson,
      loadXml,
      metadata,
      originalFileName,
      page,
      percent,
      resetProject,
      savedCount,
      searchTerm,
      searchScope,
      sections,
      showAccepted,
      showEmpty,
      useRegex,
      regexError,
      compiledRegex,
      sourceVersion,
      total,
      totalPages,
      updateEntry,
      xmlDoc,
    ],
  );
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
