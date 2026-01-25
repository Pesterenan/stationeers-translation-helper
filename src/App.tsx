import React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Box, Button, useTheme, Container, Grid, Paper } from "@mui/material";

import { parseStationeersXml, buildTranslatedStationeersXml, updateMetadataInXml } from "./lib/xmlParser";
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
    return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
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
      const { entries: parsedEntries, xmlDocument, metadata: meta } = parseStationeersXml(text);

      const initialized = parsedEntries.map((e) => ({
        ...e,
        savedTranslation: undefined,
        status: "unchanged" as Entry["status"],
      }));

      setEntries(initialized);
      setXmlDoc(xmlDocument);
      setMetadata(meta);
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
      // Primeiro aplica os metadados atuais ao XMLDoc antes de gerar
      let docToUse = xmlDoc;
      if (metadata) {
         const updatedXmlStr = updateMetadataInXml(xmlDoc, metadata);
         // Reparse simples para ter o doc atualizado (ou altere updateMetadataInXml para retornar doc)
         // Como updateMetadataInXml retorna string, vamos usar parseStationeersXml (apenas para pegar o doc)
         // Esta é uma operação um pouco pesada, mas segura. 
         // Alternativa: updateMetadataInXml poderia modificar o doc in-place se quiséssemos.
         const { xmlDocument } = parseStationeersXml(updatedXmlStr);
         docToUse = xmlDocument;
      }

      const xml = buildTranslatedStationeersXml(docToUse, entries);
      const fileName = metadata?.Language?.toLocaleLowerCase().replaceAll(/\ /g, '-') ?? 'translated';
      downloadFile(`${fileName}.xml`, xml, "text/xml;charset=utf-8");
    } catch (err: any) {
      console.error("Erro ao gerar XML traduzido:", err);
      alert("Erro ao gerar XML traduzido: " + (err?.message ?? String(err)));
    }
  }, [xmlDoc, entries, metadata]);

  const handleExportFiles = React.useCallback(() => {
    if (!entries || entries.length === 0) {
      alert("Nenhuma entrada carregada para exportar.");
      return;
    }
    try {
      exportFinalFilesAsZip(metadata ?? {}, categories, { zipName: 'stationeers_translation' });
    } catch (err: any) {
      console.error("Erro ao exportar arquivos:", err);
      alert("Erro ao exportar arquivos: " + (err?.message ?? String(err)));
    }
  }, [categories, metadata, entries]);

  // ---- render ----
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Stationeers Translation Helper
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Importe o arquivo XML original do jogo, edite as traduções e exporte para o formato correto.
        </Typography>
      </Box>

      {/* Control Bar: Metadata + Actions */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* Actions Toolbar */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <FileImporter onXml={onXml} onProgressJson={onProgressJson} />
          
          <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}

          <Button variant="outlined" onClick={handleExportProgress} disabled={entries.length === 0}>
            Salvar Progresso (JSON)
          </Button>
          <Button variant="outlined" color="success" onClick={handleSaveAll} disabled={entries.length === 0}>
            Aceitar Todos (Editados)
          </Button>
          <Button variant="outlined" onClick={handleDownloadTranslatedXml} disabled={!xmlDoc}>
            Baixar XML Único
          </Button>
          <Button variant="contained" onClick={handleExportFiles} disabled={entries.length === 0}>
            Exportar ZIP (Final)
          </Button>
        </Paper>

        {/* Metadata Editor (Conditional) */}
        {metadata && (
          <MetadataCard
            metadata={metadata}
            onUpdate={(m) => setMetadata(m)}
          />
        )}

        {/* Progress */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">Progresso da Tradução</Typography>
            <Typography variant="caption">{savedCount} / {total} ({percent}%)</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.palette.grey[200],
              [`& .${linearProgressClasses.bar}`]: { borderRadius: 5 },
            }}
          />
        </Box>
      </Box>

      <CardsGrid entries={entries} page={page} onPageChange={setPage} onChange={handleChange} onAccept={handleAccept} />
    </Container>
  );
}