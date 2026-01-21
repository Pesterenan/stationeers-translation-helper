import React from "react";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

import {
  parseStationeersXml,
  buildTranslatedStationeersXml,
} from "./lib/xmlParser";
import { downloadFile } from "./lib/fileHelpers";
import type { Entry } from "./types";
import {
  updateTranslation as updateTranslationHelper,
  acceptTranslation,
} from "./lib/entryHelpers";

import FileImporter from "./components/FileImporter";
import CardsGrid from "./components/CardsGrid";

import { Box, useTheme } from "@mui/material";

export default function App() {
  const theme = useTheme();
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = React.useState<XMLDocument | null>(null);
  const [page, setPage] = React.useState<number>(1);

  const savedCount = entries.filter((e) => e.status === "saved").length;
  const total = entries.length;
  const percent = total === 0 ? 0 : Math.round((savedCount / total) * 100);

  const onXml = (text: string) => {
    const { entries: parsedEntries, xmlDocument } = parseStationeersXml(text);
    // inicial status/savedTranslation vazio
    const initialized = parsedEntries.map((e) => ({
      ...e,
      savedTranslation: undefined,
      status: "unchanged" as Entry["status"],
    }));
    setEntries(initialized);
    setXmlDoc(xmlDocument);
    setPage(1);
  };

  const onProgressJson = (jsonText: string) => {
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
  };

  const handleChange = (key: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? updateTranslationHelper(e, value) : e)),
    );
  };

  const handleAccept = (key: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? acceptTranslation(e) : e)),
    );
  };

  const handleExportProgress = () => {
    const translations = entries.reduce<Record<string, string>>((acc, e) => {
      if (e.savedTranslation) acc[e.key] = e.savedTranslation;
      return acc;
    }, {});
    downloadFile(
      "progress.json",
      JSON.stringify({ translations }, null, 2),
      "application/json;charset=utf-8",
    );
  };

  const handleSaveAll = () => {
    // marca todos edited como saved
    setEntries((prev) =>
      prev.map((e) => (e.status === "edited" ? acceptTranslation(e) : e)),
    );
  };

  const handleDownloadTranslatedXml = () => {
    if (!xmlDoc) return alert("Nenhum XML carregado");
    const xml = buildTranslatedStationeersXml(xmlDoc, entries);
    downloadFile("translated.xml", xml, "text/xml;charset=utf-8");
  };

  return (
    <div>
      <h1>Stationeers Translation Helper</h1>
      <FileImporter onXml={onXml} onProgressJson={onProgressJson} />
      {/* botões de salvar/exportar */}
      <button onClick={handleExportProgress}>Exportar Progresso (JSON)</button>
      <button onClick={handleSaveAll}>Salvar Tudo (Aceitar)</button>
      <button onClick={handleDownloadTranslatedXml}>
        Baixar XML traduzido
      </button>

      {/* <div> */}
      {/*   <button onClick={exportProgressJson}>Exportar progresso (JSON)</button> */}
      {/*   <button onClick={downloadTranslatedXml}>Baixar XML traduzido</button> */}
      {/* </div> */}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">{`Progresso: ${savedCount}/${total} (${percent}%)`}</Typography>
          <LinearProgress variant="determinate" value={percent} sx={{
          height: 8,
        borderRadius: 4,
        backgroundColor: theme.palette.action.disabledBackground,
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 4,
          }}}/>
        </Box>
      <CardsGrid
        entries={entries}
        page={page}
        onPageChange={setPage}
        onChange={handleChange}
        onAccept={handleAccept}
      />
    </div>
  );
}
