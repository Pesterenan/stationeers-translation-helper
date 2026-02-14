import React from "react";
import {
  Button,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Tooltip,
  Typography,
  linearProgressClasses,
  useTheme,
} from "@mui/material";
import FileImporter from "./FileImporter";
import MetadataCard from "./MetadataCard";
import { Search } from "@mui/icons-material";
import { useTranslationContext } from "../context/TranslationContext";

const ProjectToolbar: React.FC = () => {
  const {
    entries,
    xmlDoc,
    metadata,
    percent,
    savedCount,
    searchTerm,
    total,
    downloadTranslatedXml,
    exportProgressJson,
    loadProgressJson,
    setMetadata,
    setSearchTerm,
    loadXml,
  } = useTranslationContext();

  const theme = useTheme();
  const [searchText, setSearchText] = React.useState(searchTerm || "");

  const hasXml = !!xmlDoc;
  const entriesCount = entries.length;

  React.useEffect(() => {
    // Se o texto for curto, atualizamos imediatamente para "resetar" a busca sem lag
    if (searchText.length <= 2) {
      setSearchTerm(searchText);
      return;
    }

    // Para textos longos (pesquisa ativa), usamos o debounce para performance
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(searchText);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, setSearchTerm]);

  return (
    <Grid
      container
      flexDirection="column"
      rowGap={2}
      width="100%"
    >
      {/* Actions Toolbar */}
      <Paper variant="outlined">
        <Grid
          container
          gap={1}
          justifyContent="space-between"
          padding={2}
          size="grow"
        >
          <FileImporter
            onXml={loadXml}
            onProgressJson={loadProgressJson}
            onStart={() => {}} // Loading agora é gerenciado pelo Contexto
          />
          {/* Metadata Editor */}
          {metadata ? (
            <MetadataCard metadata={metadata} onUpdate={setMetadata} />
          ) : (
            <Grid size="grow" />
          )}

          <Button
            variant="outlined"
            onClick={exportProgressJson}
            disabled={entriesCount === 0}
          >
            Salvar Progresso
          </Button>
          <Button
            variant="contained"
            onClick={downloadTranslatedXml}
            disabled={!hasXml}
          >
            Baixar XML
          </Button>
        </Grid>
      </Paper>

      {/* Global Progress */}
      {entriesCount > 0 && (
        <Grid
          container
          flexDirection="row"
          flexWrap="nowrap"
        >
          <Grid container alignItems="center" paddingInline={2}>
            <TextField
              id="search"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Digite mais que 3 letras do que está procurando para pesquisar">
                        <Search />
                      </Tooltip>
                    </InputAdornment>
                  ),
                  placeholder: "Pesquisar",
                  size: "small",
                  sx: { borderRadius: "100px" },
                },
              }}
              onChange={(event) => setSearchText(event.currentTarget.value)}
              value={searchText}
              variant="outlined"
            />
          </Grid>
           <Grid container flexDirection="column" size="grow" paddingInline={2}>
            <Grid container flexDirection="row" justifyContent="space-between">
              <Typography variant="caption" fontWeight="bold">
                Progresso Total
              </Typography>
              <Typography variant="caption">
                {savedCount} / {total} ({percent}%)
              </Typography>
            </Grid>
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
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectToolbar;
