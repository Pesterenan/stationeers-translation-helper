import React from "react";
import Typography from "@mui/material/Typography";
import {
  Box,
  Container,
  Paper,
  Backdrop,
  CircularProgress,
  Grid,
} from "@mui/material";

import CardsGrid from "./components/CardsGrid";
import MetadataCard from "./components/MetadataCard";
import ProjectToolbar from "./components/ProjectToolbar";
import SectionTabs from "./components/SectionTabs";

import { useTranslationProject } from "./hooks/useTranslationProject";

export default function App() {
  const {
    entries,
    xmlDoc,
    metadata,
    isLoading,
    page,
    activeSection,
    categories,
    sections,
    savedCount,
    total,
    percent,
    setMetadata,
    setPage,
    loadXml,
    loadProgressJson,
    updateEntry,
    acceptEntry,
    exportProgressJson,
    downloadTranslatedXml,
    changeTab,
  } = useTranslationProject();

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
      <ProjectToolbar 
        entriesCount={entries.length}
        hasXml={!!xmlDoc}
        savedCount={savedCount}
        totalCount={total}
        percent={percent}
        onXml={loadXml}
        onProgressJson={loadProgressJson}
        onStartLoading={() => {}} // Loading handled inside hooks mostly, but exposed if needed
        onExportProgress={exportProgressJson}
        onDownloadXml={downloadTranslatedXml}
      />

      {/* Metadata Editor */}
      {metadata && (
        <MetadataCard metadata={metadata} onUpdate={(m) => setMetadata(m)} />
      )}

      {/* Section Tabs */}
      <SectionTabs 
        sections={sections}
        activeSection={activeSection}
        categories={categories}
        onChange={changeTab}
      />

      {/* Content Grid */}
      {entries.length > 0 ? (
        <CardsGrid
          entries={currentSectionEntries}
          page={page}
          onPageChange={setPage}
          onChange={updateEntry}
          onAccept={acceptEntry}
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
        <Grid
          alignItems="center"
          container
          flexDirection="column"
          gap={2}
          justifyContent="center"
        >
          <Typography variant="h4">Carregando arquivo</Typography>
          <CircularProgress color="inherit" />
        </Grid>
      </Backdrop>
    </Container>
  );
}
