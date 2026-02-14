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
  sections: string[];
  xmlDoc: XMLDocument | null;

  // Stats
  percent: number;
  savedCount: number;
  total: number;
  totalPages: number;

  // Setters
  setMetadata: (meta: IMetadata) => void;
  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;

  // Actions
  acceptEntry: (id: string) => void;
  changeTab: (newValue: string) => void;
  downloadTranslatedXml: () => void;
  exportProgressJson: () => void;
  loadProgressJson: (jsonText: string) => void;
  loadXml: (text: string, fileName?: string) => void;
  updateEntry: (id: string, value: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = useState<IMetadata | undefined>(undefined);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Group entries by section (Memoized: only re-runs when entries change)
  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
      const key = entry.section;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [entries]);

  // Filter categories based on search term
  const categories = useMemo(() => {
    if (!searchTerm || searchTerm.length <= 2) {
      return groupedEntries;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const result: Record<string, Entry[]> = {};

    Object.entries(groupedEntries).forEach(([section, sectionEntries]) => {
      const matches = sectionEntries.filter((entry) => {
        const matchKey = entry.key.toLowerCase().includes(lowerTerm);
        const matchOriginal = entry.original.toLowerCase().includes(lowerTerm);
        const matchTranslation = entry.savedTranslation
          ?.toLowerCase()
          .includes(lowerTerm);

        return matchKey || matchOriginal || matchTranslation;
      });

      if (matches.length > 0) {
        result[section] = matches;
      }
    });

    return result;
  }, [groupedEntries, searchTerm]);

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

  // Actions
  const loadXml = useCallback((text: string, fileName?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const {
          entries: parsedEntries,
          xmlDocument,
          metadata: meta,
        } = parseStationeersXml(text);

        const initialized = parsedEntries.map((e) => ({
          ...e,
          savedTranslation: undefined,
          status: "unchanged" as Entry["status"],
        }));

        const uniqueSections = Array.from(
          new Set(parsedEntries.map((e) => e.section)),
        ).sort();
        const firstSection = uniqueSections.length > 0 ? uniqueSections[0] : "";

        setEntries(initialized);
        setXmlDoc(xmlDocument);
        setMetadata(meta);
        setOriginalFileName(fileName || "");
        setActiveSection(firstSection);
        setPage(1);
      } catch (err: any) {
        console.error("Erro ao parsear XML:", err);
        alert("Erro ao parsear XML: " + (err?.message ?? String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 600); // 600ms para aguardar animação da UI
  }, []);

  // Load mock data on development
  useEffect(() => {
    fetch("/mock_language.xml")
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error("Mock not found");
      })
      .then((text) => {
        loadXml(text, "mock_language.xml");
      })
      .catch(() => {
        // Silently ignore if mock is not available
      });
  }, [loadXml]);

  const loadProgressJson = useCallback((jsonText: string) => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const obj = JSON.parse(jsonText);
        const translations: Record<string, string> = obj.translations ?? {};

        setEntries((prev) =>
          prev.map((e) => {
            const combinedKey = `${e.section}|${e.key}`;
            const saved = translations[combinedKey];

            if (saved != null) {
              return {
                ...e,
                savedTranslation: saved,
                translation: saved,
                status: saved ? "saved" : "unchanged",
              };
            }
            return e;
          }),
        );
      } catch (err: any) {
        console.error("Erro ao importar progresso JSON:", err);
        alert(
          "Erro ao importar progresso JSON: " + (err?.message ?? String(err)),
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
    const translations = entries.reduce<Record<string, string>>((acc, e) => {
      if (e.savedTranslation) {
        const exportKey = `${e.section}|${e.key}`;
        acc[exportKey] = e.savedTranslation;
      }
      return acc;
    }, {});

    const exportData = {
      metadata,
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
  }, [entries, metadata, originalFileName]);

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

        let fileName = "translated.xml";
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

        downloadFile(fileName, xml, "text/xml;charset=utf-8");
      } catch (err: any) {
        console.error("Erro ao gerar XML traduzido:", err);
        alert("Erro ao gerar XML traduzido: " + (err?.message ?? String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, [xmlDoc, metadata, entries, originalFileName]);

  const changeTab = useCallback((newValue: string) => {
    setActiveSection(newValue);
    setPage(1);
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
      sections,
      xmlDoc,
      percent,
      savedCount,
      total,
      totalPages,
      setMetadata,
      setPage,
      setSearchTerm,
      acceptEntry,
      changeTab,
      downloadTranslatedXml,
      exportProgressJson,
      loadProgressJson,
      loadXml,
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
      sections,
      xmlDoc,
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
