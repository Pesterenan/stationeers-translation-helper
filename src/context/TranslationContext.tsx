import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { type Entry, type IMetadata } from "../types";
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

// Definição do Tipo do Contexto
interface TranslationContextType {
  // State
  activeSection: string;
  categories: Record<string, Entry[]>;
  entries: Entry[];
  isLoading: boolean;
  metadata: IMetadata | undefined;
  page: number;
  searchTerm: string;
  showAccepted: boolean;
  showEmpty: boolean;
  sections: string[];
  xmlDoc: XMLDocument | null;
  sourceVersion: string | null;
  lastAutoSave: Date | null;

  // Stats
  percent: number;
  savedCount: number;
  total: number;
  totalPages: number;

  // Setters
  setMetadata: (meta: IMetadata) => void;
  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setShowAccepted: (hide: boolean) => void;
  setShowEmpty: (show: boolean) => void;

  // Actions
  acceptEntry: (id: string) => void;
  changeTab: (newValue: string) => void;
  downloadTranslatedXml: () => void;
  exportProgressJson: () => void;
  loadProgressJson: (jsonText: string) => void;
  loadXml: (text: string, fileName?: string, version?: string) => void;
  resetProject: () => void;
  updateEntry: (id: string, value: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = useState<IMetadata | undefined>(() => {
    const saved = localStorage.getItem("sth_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return undefined;
      }
    }
    return undefined;
  });
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [sourceVersion, setSourceVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAccepted, setShowAccepted] = useState<boolean>(true);
  const [showEmpty, setShowEmpty] = useState<boolean>(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Helper to get storage key
  const getStorageKey = useCallback((lang?: string, code?: string) => {
    const l = lang?.toLowerCase().replace(/\s+/g, "-").trim() || "unknown";
    const c = code?.toLowerCase().replace(/\s+/g, "-").trim() || "";
    const suffix = c ? `${l}_${c}` : l;
    return `sth_draft_${suffix}`;
  }, []);

  // Sync metadata to localStorage
  useEffect(() => {
    if (metadata) {
      localStorage.setItem("sth_config", JSON.stringify(metadata));
    } else {
      localStorage.removeItem("sth_config");
    }
  }, [metadata]);

  // Group entries by section (Memoized: only re-runs when entries change)
  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
      const key = entry.section;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [entries]);

    // Filter categories based on search term AND hideAccepted
    const categories = useMemo(() => {
      const lowerTerm = searchTerm.toLowerCase();
      const isSearchActive = searchTerm.length > 2;
      const result: Record<string, Entry[]> = {};
  
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
            const matchKey = entry.key.toLowerCase().includes(lowerTerm);
            const matchOriginal = entry.original.toLowerCase().includes(lowerTerm);
            const matchTranslation = entry.savedTranslation
              ?.toLowerCase()
              .includes(lowerTerm);
  
            return matchKey || matchOriginal || matchTranslation;
          }
  
          return true;
        });
  
        if (matches.length > 0) {
          result[section] = matches;
        }
      });
  
      return result;
    }, [groupedEntries, searchTerm, showEmpty, showAccepted]);
  
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
    const savedCount = useMemo(
      () => entries.filter((e) => e.status === "saved").length,
      [entries],
    );
    const total = entries.length;
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
  
        localStorage.setItem(getStorageKey(metadata.Language, metadata.Code), JSON.stringify(draftData));
        setLastAutoSave(new Date());
      }, 3000); // Save after 3s of inactivity
  
      return () => clearTimeout(timeoutId);
    }, [entries, metadata, getStorageKey]);
  
    // Actions
    const loadXml = useCallback((text: string, fileName?: string, version?: string) => {
      setIsLoading(true);
      setTimeout(() => {
        try {
          const {
            entries: parsedEntries,
            xmlDocument,
            metadata: xmlMeta,
          } = parseStationeersXml(text);
  
          // Priority: 1. Current sth_config (manually set), 2. XML metadata
          // If we have a Language in sth_config, we assume this is the target project.
          const finalMeta = {
            Language: metadata?.Language || xmlMeta.Language,
            Code: metadata?.Code || xmlMeta.Code,
            Font: metadata?.Font || xmlMeta.Font,
            ExportFileName: metadata?.ExportFileName,
          };

          // Debug draft recovery
          console.log("Tentando recuperar rascunho para:", finalMeta.Language, finalMeta.Code);

          // Check for existing draft in LocalStorage
          const storageKey = getStorageKey(finalMeta.Language || "", finalMeta.Code || "");
          const savedDraft = localStorage.getItem(storageKey);
          let draftTranslations: Record<string, string | { translation: string, original: string }> = {};
  
          if (savedDraft) {
            try {
              const parsed = JSON.parse(savedDraft);
              // Only load if it's the same language/code (implicit by key, but good to be safe)
              draftTranslations = parsed.translations || {};
              console.log(`Rascunho para ${finalMeta.Language} recuperado do LocalStorage.`);
            } catch (e) {
              console.error("Erro ao ler rascunho do LocalStorage", e);
            }
          }
  
          const initialized = parsedEntries.map((e) => {
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
          console.error("Erro ao parsear XML:", err);
          const message = err instanceof Error ? err.message : String(err);
          alert("Erro ao parsear XML: " + message);
        } finally {
          setIsLoading(false);
        }
      }, 600); // 600ms para aguardar animação da UI
    }, [getStorageKey]);
  
    // // Load mock data on development
    // useEffect(() => {
    //   fetch("/mock_language.xml")
    //     .then((res) => {
    //       if (res.ok) return res.text();
    //       throw new Error("Mock not found");
    //     })
    //     .then((text) => {
    //       loadXml(text, "mock_language.xml");
    //     })
    //     .catch(() => {
    //       // Silently ignore if mock is not available
    //     });
    // }, [loadXml]);
  
    const loadProgressJson = useCallback((jsonText: string) => {
      setIsLoading(true);
      setTimeout(() => {
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
          console.error("Erro ao importar progresso JSON:", err);
          alert(
            "Erro ao importar progresso JSON: " + message,
          );
        } finally {
          setIsLoading(false);
        }
      }, 600);
    }, []);
  
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
        fileName = `${
          metadata?.Language?.toLowerCase().replace(/\s+/g, "-") || "stationeers"
        }-translation-progress.json`;
      }
  
      downloadFile(
        fileName,
        JSON.stringify(exportData, null, 2),
        "application/json;charset=utf-8",
      );
    }, [entries, metadata, originalFileName, sourceVersion]);
  
    const downloadTranslatedXml = useCallback(() => {
      if (!xmlDoc) return alert("Nenhum XML carregado");
      setIsLoading(true);
      setTimeout(() => {
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
          console.error("Erro ao gerar XML traduzido:", err);
          const message = err instanceof Error ? err.message : String(err);
          alert("Erro ao gerar XML traduzido: " + message);
        } finally {
          setIsLoading(false);
        }
      }, 600);
    }, [xmlDoc, metadata, entries, originalFileName]);
  
    const changeTab = useCallback((newValue: string) => {
      setActiveSection(newValue);
      setPage(1);
    }, []);

    const resetProject = useCallback(() => {
      if (confirm("Isso irá limpar as configurações do idioma e o arquivo carregado. Deseja continuar?")) {
        setEntries([]);
        setXmlDoc(null);
        setMetadata(undefined);
        setOriginalFileName("");
        setSourceVersion(null);
        setPage(1);
        setActiveSection("");
      }
    }, []);

      const value = useMemo(
        () => ({
          activeSection,
          categories,
          entries,
          isLoading,
          metadata,
          page,
          searchTerm,
          showAccepted,
          showEmpty,
          sections,
          xmlDoc,
          sourceVersion,
          lastAutoSave,
          percent,
          savedCount,
          total,
          totalPages,
          setMetadata,
          setPage,
          setSearchTerm,
          setShowAccepted,
          setShowEmpty,
          acceptEntry,
          changeTab,
          downloadTranslatedXml,
          exportProgressJson,
          loadProgressJson,
          loadXml,
          resetProject,
          updateEntry,
        }),
        [
          activeSection,
          categories,
          entries,
          isLoading,
          metadata,
          page,
          searchTerm,
          showAccepted,
          showEmpty,
          sections,
          xmlDoc,
          sourceVersion,
          lastAutoSave,
          percent,
          savedCount,
          total,
          totalPages,
          // Actions que são estáveis (useCallback) não precisam entrar no deps array
          // se quisermos ser puristas, mas é seguro listar.
          acceptEntry,
          changeTab,
          downloadTranslatedXml,
          exportProgressJson,
          loadProgressJson,
          loadXml,
          resetProject,
          updateEntry,
        ],
      );
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error(
      "useTranslationContext must be used within a TranslationProvider",
    );
  }
  return context;
}
