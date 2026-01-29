import React from "react";
import {
  Button,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  linearProgressClasses,
  useTheme,
} from "@mui/material";
import FileImporter from "./FileImporter";

type Props = {
  // Data
  entriesCount: number;
  hasXml: boolean;
  metadata?: IMetadata;
  percent: number;
  savedCount: number;
  totalCount: number;

  // Handlers
  onDownloadXml: () => void;
  onExportProgress: () => void;
  onProgressJson: (text: string) => void;
  onSetMetadata: (metadata: IMetadata) => void;
  onStartLoading: () => void;
  onXml: (text: string, fileName?: string) => void;
};

const ProjectToolbar: React.FC<Props> = ({
  entriesCount,
  hasXml,
  metadata,
  percent,
  savedCount,
  totalCount,
  onDownloadXml,
  onExportProgress,
  onProgressJson,
  onSetMetadata,
  onStartLoading,
  onXml,
}) => {
  const theme = useTheme();

  return (
    <Grid container flexDirection="column" rowGap={1} paddingBlock={2}>
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
            <InputLabel id="search-label">Pesquisar</InputLabel>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectToolbar;
