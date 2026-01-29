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
import type { IMetadata } from "../types";
import { Search } from "@mui/icons-material";

type Props = {
  // Data
  entriesCount: number;
  hasXml: boolean;
  metadata?: IMetadata;
  percent: number;
  savedCount: number;
  searchTerm: string;
  totalCount: number;

  // Handlers
  onDownloadXml: () => void;
  onExportProgress: () => void;
  onProgressJson: (text: string) => void;
  onSetMetadata: (metadata: IMetadata) => void;
  onSetSearchTerm: (search: string) => void;
  onStartLoading: () => void;
  onXml: (text: string, fileName?: string) => void;
};

const ProjectToolbar: React.FC<Props> = ({
  entriesCount,
  hasXml,
  metadata,
  percent,
  savedCount,
  searchTerm,
  totalCount,
  onDownloadXml,
  onExportProgress,
  onProgressJson,
  onSetMetadata,
  onSetSearchTerm,
  onStartLoading,
  onXml,
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = React.useState(searchTerm || '');
  
  React.useEffect(() => {
    // Se o texto for curto, atualizamos imediatamente para "resetar" a busca sem lag
    if (searchText.length <= 2) {
      onSetSearchTerm(searchText);
      return;
    }

    // Para textos longos (pesquisa ativa), usamos o debounce para performance
    const delayDebounceFn = setTimeout(() => {
      onSetSearchTerm(searchText);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, onSetSearchTerm]);

  return (
    <Grid container flexDirection="column" rowGap={1} paddingBlock={2} width="100%">
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
            onXml={onXml}
            onProgressJson={onProgressJson}
            onStart={onStartLoading}
          />
          {/* Metadata Editor */}
          {metadata ? (
            <MetadataCard metadata={metadata} onUpdate={onSetMetadata} />
          ) : (
            <Grid size="grow" />
          )}

          <Button
            variant="outlined"
            onClick={onExportProgress}
            disabled={entriesCount === 0}
          >
            Salvar Progresso
          </Button>
          <Button
            variant="contained"
            onClick={onDownloadXml}
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
          columnGap={8}
          marginInline={2}
        >
          <Grid container flexDirection="column" size="grow">
            <Grid container flexDirection="row" justifyContent="space-between">
              <Typography variant="caption" fontWeight="bold">
                Progresso Total
              </Typography>
              <Typography variant="caption">
                {savedCount} / {totalCount} ({percent}%)
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
          <Grid container alignItems="center" gap={2}>
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
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectToolbar;
