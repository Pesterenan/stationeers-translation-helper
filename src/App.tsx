import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import { CircularProgress, Container, Grid, Pagination, Paper } from "@mui/material";

import TranslationsList from "./components/TranslationsList";
import ProjectToolbar from "./components/ProjectToolbar";
import SectionTabs from "./components/SectionTabs";
import DialogGoToPage from "./components/dialogs/DialogGoToPage";
import DialogConfig from "./components/dialogs/DialogConfig";

import { useDialogContext } from "./context/useDialogContext";
import { useTranslationContext } from "./context/useTranslationContext";
import { useI18nContext } from "./context/useI18nContext";

export default function App() {
  const { totalPages, xmlDoc, isLoading, page, setPage } =
    useTranslationContext();
  const { openDialog } = useDialogContext();
  const { t } = useI18nContext();

  const hasXml = !!xmlDoc;
  const showContent = hasXml || isLoading;
  const showFooter = hasXml && !isLoading;

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CTRL+G (or CMD+G) to open Go To Page
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        if (hasXml) {
          e.preventDefault();
          openDialog("GOTO_PAGE");
        }
      }

      // CTRL+F (or CMD+F) to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        if (hasXml) {
          e.preventDefault();
          const searchInput = document.getElementById("search") as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasXml, openDialog]);

  return (
    <Container maxWidth="xl">
      <Grid
        container
        flexDirection="column"
        flexWrap="nowrap"
        sx={{ height: "100vh", overflow: "hidden" }}
      >
        {/* Global Dialogs */}
        <DialogGoToPage />
        <DialogConfig />

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
              {t('app.title')}
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
                {t('app.subtitle')}
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
                      {t('app.loading')}
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
                      marginBottom: "4.5rem",
                    }}
                  >
                    <TranslationsList />
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
    </Container>
  );
}
