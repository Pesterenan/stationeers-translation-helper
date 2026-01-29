import { useState, useCallback, useMemo, useEffect } from "react";
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

export function useTranslationProject() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = useState<IMetadata | undefined>(undefined);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination & Navigation
  const [page, setPage] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<string>("");

  // Group entries by section (Memoized: only re-runs when entries change)
  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
      const key = entry.section;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [entries]);

  // Filter categories based on search term (Memoized: runs when searchTerm or groupedEntries change)
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
        const matchTranslation = entry.savedTranslation?.toLowerCase().includes(lowerTerm);
        
        return matchKey || matchOriginal || matchTranslation;
      });

      if (matches.length > 0) {
        result[section] = matches;
      }
    });

    return result;
  }, [groupedEntries, searchTerm]);

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
      } catch (err) {
        console.error("Erro ao parsear XML:", err);
        alert("Erro ao parsear XML: " + (err?.message ?? String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, []);

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
        const ext = parts.pop(); // remove extension
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
          // Insert _translated before extension
          const parts = originalFileName.split(".");
          if (parts.length > 1) {
            const ext = parts.pop();
            fileName = `${parts.join(".")}_translated.${ext}`;
          } else {
            fileName = `${originalFileName}_translated.xml`;
          }
        } else {
          // Fallback to Language Name if no original filename
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

  return {
    // State
    activeSection,
    categories,
    entries,
    isLoading,
    metadata,
    page,
    searchTerm,
    sections,
    xmlDoc,

    // Stats
    percent,
    savedCount,
    total,

    // Setters (if needed directly)
    setMetadata,
    setPage,
    setSearchTerm,

    // Actions
    acceptEntry,
    changeTab,
    downloadTranslatedXml,
    exportProgressJson,
    loadProgressJson,
    loadXml,
    updateEntry,
  };
}
