import React from "react";
import Typography from "@mui/material/Typography";
import {
  Backdrop,
  CircularProgress,
  Grid,
  Pagination,
  Paper,
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

  const hasXml = !!xmlDoc;
  const PAGE_SIZE = 20;

  // Filtragem para o grid atual
  const currentSectionEntries = React.useMemo(() => {
    return categories[activeSection] || [];
  }, [categories, activeSection]);

  const totalPages = Math.max(
    1,
    Math.ceil(currentSectionEntries.length / PAGE_SIZE),
  );

  // ---- render ----
  return (
    <Grid
      container
      flexDirection="column"
      flexWrap="nowrap"
      sx={{ height: "100vh", overflow: "hidden" }}
    >
      {/* Header & Toolbar Section */}
      <Grid
        container
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          flexGrow: hasXml ? 0 : 1,
          transition: "flex-grow 0.5s ease-in-out, padding 0.5s ease-in-out",
          p: hasXml ? 2 : 4,
          borderBottom: hasXml ? "1px solid" : "none",
          borderColor: "divider",
          zIndex: 1100,
        }}
      >
        <Grid sx={{ textAlign: "center", mb: hasXml ? 1 : 3, transition: "margin-bottom 0.5s ease-in-out" }}>
          <Typography
            variant={hasXml ? "h5" : "h3"}
            component="h1"
            fontWeight="bold"
            sx={{ transition: "font-size 0.5s ease-in-out" }}
          >
            Stationeers Translation Helper
          </Typography>
          {!hasXml && (
            <Typography variant="body1" color="text.secondary">
              Importe o arquivo XML original do jogo, edite as traduções e
              exporte o novo XML
            </Typography>
          )}
        </Grid>

        <ProjectToolbar
          entriesCount={entries.length}
          hasXml={hasXml}
          metadata={metadata}
          savedCount={savedCount}
          totalCount={total}
          percent={percent}
          searchTerm={searchTerm}
          onSetSearchTerm={setSearchTerm}
          onXml={loadXml}
          onProgressJson={loadProgressJson}
          onStartLoading={() => {}}
          onExportProgress={exportProgressJson}
          onDownloadXml={downloadTranslatedXml}
          onSetMetadata={setMetadata}
        />
      </Grid>

      {/* Main Content Area (Tabs + Scrollable Grid) */}
      {hasXml && (
        <Grid
          container
          flexDirection="column"
          flexWrap="nowrap"
          size="grow"
        >
          <Grid sx={{ zIndex: 10 }}>
            <SectionTabs
              sections={sections}
              activeSection={activeSection}
              categories={categories}
              onChange={changeTab}
            />
          </Grid>

          <Grid
            size="grow"
            sx={{
              overflowY: "auto",
              p: 2,
              marginBottom: "4.5rem", // Espaço para o footer não cobrir o último card
            }}
          >
            <CardsGrid
              entries={currentSectionEntries}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              onChange={updateEntry}
              onAccept={acceptEntry}
            />
          </Grid>
        </Grid>
      )}

      {/* Footer (Pagination) */}
      {hasXml && (
        <Paper
          elevation={10}
          square
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: "flex",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Paper>
      )}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 2 }}
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
    </Grid>
  );
}
