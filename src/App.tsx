import React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Box, Button, useTheme } from "@mui/material";

import { parseStationeersXml, buildTranslatedStationeersXml,  updateMetadataInXml } from "./lib/xmlParser";
import { downloadFile } from "./lib/fileHelpers";
import { type Entry } from "./types";
import { updateTranslation as updateTranslationHelper, acceptTranslation } from "./lib/entryHelpers";

import FileImporter from "./components/FileImporter";
import CardsGrid from "./components/CardsGrid";

import { exportFinalFilesAsZip } from "./lib/exportAllFiles";
import MetadataCard from './components/MetadataCard';

export default function App() {
  const theme = useTheme();

  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = React.useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = React.useState<Record<string, string | undefined> | undefined>(undefined);
  const [page, setPage] = React.useState<number>(1);

  // categories será recalculado quando entries ou rules mudarem
  const categories = React.useMemo(() => {
    return entries.reduce<Record<string,Entry[]>>((acc, entry) => {
      const key = entry.section;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [entries]);

  // progresso
  const savedCount = React.useMemo(() => entries.filter((e) => e.status === "saved").length, [entries]);
  const total = entries.length;
  const percent = total === 0 ? 0 : Math.round((savedCount / total) * 100);

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
      const fileName = metadata?.Language?.toLocaleLowerCase().replaceAll(/\ /g, '-') ?? 'translated';
      downloadFile(`${fileName}.xml`, xml, "text/xml;charset=utf-8");
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
        <FileImporter onXml={onXml} onProgressJson={onProgressJson} />
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

      <MetadataCard
        metadata={metadata}
        onUpdate={(m) => setMetadata(m)}
        onApplyToXml={() => {
          if (!xmlDoc || !metadata) return;
          const updatedXml = updateMetadataInXml(xmlDoc, metadata);
          // opcional: você pode reparsear (parseStationeersXml) o xml atualizado para atualizar xmlDoc entries, 
          // ou apenas usar updatedXml no export.
          // Exemplo: substituir xmlDoc com parsed updatedXml:
          try {
            const { xmlDocument } = parseStationeersXml(updatedXml);
            setXmlDoc(xmlDocument);
          } catch (e) {
            console.error("Erro ao aplicar metadados no XML:", e);
            alert("Erro ao aplicar metadados no XML: " + String(e));
          }
        }}
      />

      <CardsGrid entries={entries} page={page} onPageChange={setPage} onChange={handleChange} onAccept={handleAccept} />
    </div>
  );
}
