import React from "react";
import Typography from "@mui/material/Typography";
import { CircularProgress, Grid, Pagination, Paper } from "@mui/material";

import CardsGrid from "./components/CardsGrid";
import ProjectToolbar from "./components/ProjectToolbar";
import SectionTabs from "./components/SectionTabs";

import { useTranslationContext } from "./context/TranslationContext";

export default function App() {
  const { totalPages, xmlDoc, isLoading, page, setPage } =
    useTranslationContext();

  const hasXml = !!xmlDoc;
  const showContent = hasXml || isLoading;
  const showFooter = hasXml && !isLoading;

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
          flexGrow: showContent ? 0 : 1,
          flexBasis: showContent ? "auto" : "100%",
          transition:
            "flex-grow 0.6s ease-in-out, flex-basis 0.6s ease-in-out, padding 0.6s ease-in-out",
          p: showContent ? 2 : 4,
          borderBottom: showContent ? "1px solid" : "0px solid",
          borderColor: "divider",
          zIndex: 1100,
        }}
      >
        <Grid
          sx={{
            textAlign: "center",
            mb: showContent ? 1 : 3,
            maxHeight: showContent ? "100px" : "500px",
            opacity: 1,
            transition: "all 0.6s ease-in-out",
          }}
        >
          <Typography
            variant={showContent ? "h5" : "h3"}
            component="h1"
            fontWeight="bold"
            sx={{ transition: "font-size 0.6s ease-in-out" }}
          >
            Stationeers Translation Helper
          </Typography>
          <Grid
            sx={{
              maxHeight: showContent ? "0px" : "100px",
              opacity: showContent ? 0 : 1,
              overflow: "hidden",
              transition: "all 0.6s ease-in-out",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Importe o arquivo XML original do jogo, edite as traduções e
              exporte o novo XML
            </Typography>
          </Grid>
        </Grid>

        <ProjectToolbar />
      </Grid>

      {/* Main Content Area (Tabs + Scrollable Grid) */}
      <Grid
        container
        flexDirection="column"
        flexWrap="nowrap"
        size="grow"
        sx={{
          flexGrow: showContent ? 1 : 0.0001,
          opacity: showContent ? 1 : 0,
          transition: "flex-grow 0.6s ease-in-out, opacity 0.6s ease-in-out",
          overflow: "hidden",
        }}
      >
        {/* Renderizamos o conteúdo interno apenas se showContent for true para performance, 
            mas o container acima garante a animação de espaço. 
            O "Loading" entra aqui dentro. */}
        {showContent && (
          <>
            {isLoading ? (
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                size="grow"
              >
                <Grid
                  container
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                >
                  <CircularProgress />
                  <Typography variant="h6" color="text.secondary">
                    Processando arquivo...
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <>
                <Grid sx={{ zIndex: 10 }}>
                  <SectionTabs />
                </Grid>

                <Grid
                  size="grow"
                  sx={{
                    overflowY: "auto",
                    p: 2,
                    marginBottom: "4.5rem", // Espaço para o footer
                  }}
                >
                  <CardsGrid />
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>

      {/* Footer (Pagination) */}
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
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: showFooter ? "translateY(0)" : "translateY(100%)",
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
    </Grid>
  );
}
