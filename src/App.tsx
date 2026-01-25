import React, { useEffect } from "react";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  useTheme,
  Container,
  Paper,
  Tabs,
  Tab,
  Chip,
  Backdrop,
  CircularProgress,
  Grid,
} from "@mui/material";

import {
  parseStationeersXml,
  buildTranslatedStationeersXml,
  updateMetadataInXml,
} from "./lib/xmlParser";
import { downloadFile } from "./lib/fileHelpers";
import { type Entry } from "./types";
import {
  updateTranslation as updateTranslationHelper,
  acceptTranslation,
} from "./lib/entryHelpers";

import FileImporter from "./components/FileImporter";
import CardsGrid from "./components/CardsGrid";

import { exportFinalFilesAsZip } from "./lib/exportAllFiles";
import MetadataCard from "./components/MetadataCard";

export default function App() {
  const theme = useTheme();

  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = React.useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = React.useState<
    Record<string, string | undefined> | undefined
  >(undefined);
  const [isLoading, setIsLoading] = React.useState(false);

  // Paginação agora é relativa à seção ativa
  const [page, setPage] = React.useState<number>(1);
  const [activeSection, setActiveSection] = React.useState<string>("");

  // Agrupa entries por seção
  const categories = React.useMemo(() => {
    const grouped = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
      const key = entry.section;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});

    // Ordena as chaves alfabeticamente para as abas ficarem estáveis
    // Mas podemos forçar algumas (como 'HelpPage' ou 'GameTip') para o fim se quisermos.
    return grouped;
  }, [entries]);

  const sections = React.useMemo(
    () => Object.keys(categories).sort(),
    [categories],
  );

  // Se a seção ativa não existir mais (ex: novo arquivo carregado), reseta para a primeira
  useEffect(() => {
    if (sections.length > 0 && !categories[activeSection]) {
      setActiveSection(sections[0]);
      setPage(1);
    } else if (sections.length === 0) {
      setActiveSection("");
    }
  }, [sections, activeSection, categories]);

  // progresso global
  const savedCount = React.useMemo(
    () => entries.filter((e) => e.status === "saved").length,
    [entries],
  );
  const total = entries.length;
  const percent = total === 0 ? 0 : Math.round((savedCount / total) * 100);

  const onXml = React.useCallback((text: string) => {
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

        setEntries(initialized);
        setXmlDoc(xmlDocument);
        setMetadata(meta);
        setPage(1);
        // activeSection será setado pelo useEffect acima
      } catch (err: any) {
        console.error("Erro ao parsear XML:", err);
        alert("Erro ao parsear XML: " + (err?.message ?? String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, []);

  const onProgressJson = React.useCallback((jsonText: string) => {
    setTimeout(() => {
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
        alert(
          "Erro ao importar progresso JSON: " + (err?.message ?? String(err)),
        );
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, []);

  // ---- actions ----
  const handleChange = React.useCallback((key: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? updateTranslationHelper(e, value) : e)),
    );
  }, []);

  const handleAccept = React.useCallback((key: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? acceptTranslation(e) : e)),
    );
  }, []);

  const handleExportProgress = React.useCallback(() => {
    const translations = entries.reduce<Record<string, string>>((acc, e) => {
      if (e.savedTranslation) acc[e.key] = e.savedTranslation;
      return acc;
    }, {});
    downloadFile(
      "progress.json",
      JSON.stringify({ translations }, null, 2),
      "application/json;charset=utf-8",
    );
  }, [entries]);

  const handleSaveAll = React.useCallback(() => {
    setEntries((prev) =>
      prev.map((e) => (e.status === "edited" ? acceptTranslation(e) : e)),
    );
  }, []);

  const handleDownloadTranslatedXml = React.useCallback(() => {
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
        const fileName =
          metadata?.Language?.toLocaleLowerCase().replaceAll(/ /g, "-") ??
          "translated";
        downloadFile(`${fileName}.xml`, xml, "text/xml;charset=utf-8");
      } catch (err: any) {
        console.error("Erro ao gerar XML traduzido:", err);
        alert("Erro ao gerar XML traduzido: " + (err?.message ?? String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [xmlDoc, entries, metadata]);

  const handleExportFiles = React.useCallback(async () => {
    if (!entries || entries.length === 0) {
      alert("Nenhuma entrada carregada para exportar.");
      return;
    }
    setIsLoading(true);
    // exportFinalFilesAsZip is already async (returns Promise)
    try {
      await exportFinalFilesAsZip(metadata ?? {}, categories, {
        zipName: "stationeers_translation",
      });
    } catch (err: any) {
      console.error("Erro ao exportar arquivos:", err);
      alert("Erro ao exportar arquivos: " + (err?.message ?? String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [categories, metadata, entries]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveSection(newValue);
    setPage(1); // Importante: Resetar paginação ao trocar de aba
  };

  // Filtragem para o grid atual
  const currentSectionEntries = React.useMemo(() => {
    return categories[activeSection] || [];
  }, [categories, activeSection]);

  // ---- render ----
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Stationeers Translation Helper
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Importe o arquivo XML original do jogo, edite as traduções e exporte
          para o formato correto.
        </Typography>
      </Box>

      {/* Control Bar: Metadata + Actions */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Actions Toolbar */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 2,
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <FileImporter
            onXml={onXml}
            onProgressJson={onProgressJson}
            onStart={() => setIsLoading(true)}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            onClick={handleExportProgress}
            disabled={entries.length === 0}
          >
            Salvar Progresso
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={handleSaveAll}
            disabled={entries.length === 0}
          >
            Aceitar Todos (Editados)
          </Button>
          <Button
            variant="outlined"
            onClick={handleDownloadTranslatedXml}
            disabled={!xmlDoc}
          >
            Baixar XML Único
          </Button>
          <Button
            variant="contained"
            onClick={handleExportFiles}
            disabled={entries.length === 0}
          >
            Exportar ZIP (Final)
          </Button>
        </Paper>

        {/* Metadata Editor */}
        {metadata && (
          <MetadataCard metadata={metadata} onUpdate={(m) => setMetadata(m)} />
        )}

        {/* Global Progress */}
        <Box sx={{ mt: 1 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption" fontWeight="bold">
              Progresso Total
            </Typography>
            <Typography variant="caption">
              {savedCount} / {total} ({percent}%)
            </Typography>
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

      {/* Section Tabs */}
      {entries.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Tabs
            value={activeSection}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            aria-label="seções do arquivo"
          >
            {sections.map((sec) => {
              const count = categories[sec]?.length ?? 0;
              const edited = categories[sec].reduce((acc, entry) => entry.status === "saved" ? acc + 1 : acc, 0);
              return (
                <Tab
                  key={sec}
                  value={sec}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {sec}
                      <Chip
                        label={edited ? `${edited}/${count}` : count}
                        size="small"
                        variant="filled"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Paper>
      )}

      {/* Content Grid */}
      {entries.length > 0 ? (
        <CardsGrid
          entries={currentSectionEntries}
          page={page}
          onPageChange={setPage}
          onChange={handleChange}
          onAccept={handleAccept}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "action.hover" }}>
          <Typography color="text.secondary">
            Carregue um arquivo XML para começar.
          </Typography>
        </Paper>
      )}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <Grid alignItems="center" container flexDirection="column" gap={2} justifyContent="center">
          <Typography variant="h4">Carregando arquivo</Typography>
          <CircularProgress color="inherit" />
        </Grid>
      </Backdrop>
    </Container>
  );
}
