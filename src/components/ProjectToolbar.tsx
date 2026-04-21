import React from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
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
import { Search, Settings } from "@mui/icons-material";
import { useTranslationContext } from "../context/TranslationContext";
import { useUIContext } from "../context/UIContext";

const ProjectToolbar: React.FC = () => {
  const {
    entries,
    xmlDoc,
    percent,
    savedCount,
    searchTerm,
    showAccepted,
    showEmpty,
    total,
    lastAutoSave,
    downloadTranslatedXml,
    exportProgressJson,
    loadProgressJson,
    setSearchTerm,
    setShowAccepted,
    setShowEmpty,
    loadXml,
  } = useTranslationContext();

  const { openDialog } = useUIContext();

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
          {/* Metadata & Config */}
          {hasXml ? (
            <Button 
              variant="outlined" 
              startIcon={<Settings />}
              onClick={() => openDialog("CONFIG")}
            >
              Configurar Projeto
            </Button>
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
          alignItems="center"
          paddingInline={2}
        >
          <Grid container alignItems="center" gap={2} size="auto">
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
                  sx: { borderRadius: "100px", width: 250 },
                },
              }}
              onChange={(event) => setSearchText(event.currentTarget.value)}
              value={searchText}
              variant="outlined"
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showAccepted} 
                  onChange={(e) => setShowAccepted(e.target.checked)} 
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ userSelect: 'none' }}>
                  Mostrar entradas aceitas
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showEmpty} 
                  onChange={(e) => setShowEmpty(e.target.checked)} 
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ userSelect: 'none' }}>
                  Mostrar entradas vazias
                </Typography>
              }
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
            {lastAutoSave && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-end', mt: 0.5, fontSize: '0.6rem' }}>
                Rascunho salvo às {lastAutoSave.toLocaleTimeString()}
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectToolbar;
