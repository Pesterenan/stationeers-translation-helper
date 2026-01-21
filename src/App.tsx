import React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Box, Button, useTheme } from "@mui/material";

import { parseStationeersXml, buildTranslatedStationeersXml } from "./lib/xmlParser";
import { downloadFile } from "./lib/fileHelpers";
import { DEFAULT_CATEGORY_RULES, type Entry } from "./types";
import { updateTranslation as updateTranslationHelper, acceptTranslation } from "./lib/entryHelpers";

import FileImporter from "./components/FileImporter";
import CardsGrid from "./components/CardsGrid";

import { parseResxToEntries } from "./lib/resxParser";
import { categorizeEntries } from "./lib/categorize";
import { exportCategoriesAsFiles } from "./lib/exporters";
import { exportFinalFilesAsZip } from "./lib/exportAllFiles";

export default function App() {
  const theme = useTheme();

  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = React.useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = React.useState<Record<string, string | undefined> | undefined>(undefined);
  const [page, setPage] = React.useState<number>(1);
  const [rules, setRules] = React.useState(DEFAULT_CATEGORY_RULES);

  // categories será recalculado quando entries ou rules mudarem
  const categories = React.useMemo(() => categorizeEntries(entries, rules), [entries, rules]);

  // progresso
  const savedCount = React.useMemo(() => entries.filter((e) => e.status === "saved").length, [entries]);
  const total = entries.length;
  const percent = total === 0 ? 0 : Math.round((savedCount / total) * 100);

  // ---- parsers ----
  const onResx = React.useCallback((text: string) => {
    try {
      const { entries: parsedEntries, metadata: parsedMetadata, xmlDocument } = parseResxToEntries(text);

      const initialized = parsedEntries.map((e) => ({
        ...e,
        savedTranslation: undefined,
        status: "unchanged" as Entry["status"],
      }));

      setEntries(initialized);
      setXmlDoc(xmlDocument);
      setMetadata(parsedMetadata);
      setPage(1);
    } catch (err: any) {
      console.error("Erro ao parsear .resx:", err);
      alert("Erro ao parsear .resx: " + (err?.message ?? String(err)));
    }
  }, []);

  const onXml = React.useCallback((text: string) => {
    try {
      const { entries: parsedEntries, xmlDocument } = parseStationeersXml(text);

      const initialized = parsedEntries.map((e) => ({
        ...e,
        savedTranslation: undefined,
        status: "unchanged" as Entry["status"],
      }));

      setEntries(initialized);
      setXmlDoc(xmlDocument);
      setPage(1);
    } catch (err: any) {
      console.error("Erro ao parsear XML:", err);
      alert("Erro ao parsear XML: " + (err?.message ?? String(err)));
    }
  }, []);

  const onProgressJson = React.useCallback((jsonText: string) => {
    try {
      const obj = JSON.parse(jsonText);
      const translations: Record<string, string> = obj.translations ?? obj;
      setEntries((prev) =>
        prev.map((e) => {
          const saved = translations[e.key];
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
      alert("Erro ao importar progresso JSON: " + (err?.message ?? String(err)));
    }
  }, []);

  // ---- actions ----
  const handleChange = React.useCallback((key: string, value: string) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? updateTranslationHelper(e, value) : e)));
  }, []);

  const handleAccept = React.useCallback((key: string) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? acceptTranslation(e) : e)));
  }, []);

  const handleExportProgress = React.useCallback(() => {
    const translations = entries.reduce<Record<string, string>>((acc, e) => {
      if (e.savedTranslation) acc[e.key] = e.savedTranslation;
      return acc;
    }, {});
    downloadFile("progress.json", JSON.stringify({ translations }, null, 2), "application/json;charset=utf-8");
  }, [entries]);

  const handleSaveAll = React.useCallback(() => {
    setEntries((prev) => prev.map((e) => (e.status === "edited" ? acceptTranslation(e) : e)));
  }, []);

  const handleDownloadTranslatedXml = React.useCallback(() => {
    if (!xmlDoc) return alert("Nenhum XML carregado");
    try {
      const xml = buildTranslatedStationeersXml(xmlDoc, entries);
      downloadFile("translated.xml", xml, "text/xml;charset=utf-8");
    } catch (err: any) {
      console.error("Erro ao gerar XML traduzido:", err);
      alert("Erro ao gerar XML traduzido: " + (err?.message ?? String(err)));
    }
  }, [xmlDoc, entries]);

  const handleExportFiles = React.useCallback(() => {
    // defensive: categories pode ser um object vazio; metadata pode ser undefined
    if (!entries || entries.length === 0) {
      alert("Nenhuma entrada carregada para exportar.");
      return;
    }
    try {
      exportFinalFilesAsZip( metadata ?? {},categories, {zipName: 'stationeers_translation'});
    } catch (err: any) {
      console.error("Erro ao exportar arquivos:", err);
      alert("Erro ao exportar arquivos: " + (err?.message ?? String(err)));
    }
  }, [categories, metadata, entries]);

  // ---- render ----
  return (
    <div style={{ padding: 16 }}>
      <h1>Stationeers Translation Helper</h1>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <FileImporter onResx={onResx} onXml={onXml} onProgressJson={onProgressJson} />
        <Button variant="outlined" onClick={handleExportProgress} disabled={entries.length === 0}>
          Exportar Progresso (JSON)
        </Button>
        <Button variant="outlined" onClick={handleSaveAll} disabled={entries.length === 0}>
          Salvar Tudo (Aceitar)
        </Button>
        <Button variant="outlined" onClick={handleDownloadTranslatedXml} disabled={!xmlDoc}>
          Baixar XML traduzido
        </Button>
        <Button variant="contained" onClick={handleExportFiles} disabled={entries.length === 0}>
          Exportar Arquivos
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">{`Progresso: ${savedCount}/${total} (${percent}%)`}</Typography>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.action.disabledBackground,
            [`& .${linearProgressClasses.bar}`]: { borderRadius: 4 },
          }}
        />
      </Box>

      {/* mostrar metadados básicos */}
      {metadata && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption">Language: {metadata.Language ?? "-"}</Typography>
          <Typography variant="caption" sx={{ ml: 2 }}>
            Code: {metadata.Code ?? "-"}
          </Typography>
          <Typography variant="caption" sx={{ ml: 2 }}>
            Font: {metadata.Font ?? "-"}
          </Typography>
        </Box>
      )}

      <CardsGrid entries={entries} page={page} onPageChange={setPage} onChange={handleChange} onAccept={handleAccept} />
    </div>
  );
}
