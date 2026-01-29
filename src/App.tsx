import React from "react";
import Typography from "@mui/material/Typography";
import {
  Container,
  Backdrop,
  CircularProgress,
  Grid,
} from "@mui/material";

import CardsGrid from "./components/CardsGrid";
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
    searchTerm,
    setSearchTerm,
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid alignItems="center" container flexDirection="column" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Stationeers Translation Helper
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Importe o arquivo XML original do jogo, edite as traduções e exporte o
          novo XML
        </Typography>
      </Grid>

      {/* Control Bar: Metadata + Actions */}
      <ProjectToolbar
        entriesCount={entries.length}
        hasXml={!!xmlDoc}
        metadata={metadata}
        savedCount={savedCount}
        totalCount={total}
        percent={percent}
        searchTerm={searchTerm}
        onSetSearchTerm={(st) => setSearchTerm(st)}
        onXml={loadXml}
        onProgressJson={loadProgressJson}
        onStartLoading={() => {}} // Loading handled inside hooks mostly, but exposed if needed
        onExportProgress={exportProgressJson}
        onDownloadXml={downloadTranslatedXml}
        onSetMetadata={(m) => setMetadata(m)}
      />

      {/* Section Tabs */}
      <SectionTabs
        sections={sections}
        activeSection={activeSection}
        categories={categories}
        onChange={changeTab}
      />

      {/* Content Grid */}
      {entries.length > 0 && (
        <CardsGrid
          entries={currentSectionEntries}
          page={page}
          onPageChange={setPage}
          onChange={updateEntry}
          onAccept={acceptEntry}
        />
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
