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
  savedCount: number;
  totalCount: number;
  percent: number;

  // Handlers
  onXml: (text: string, fileName?: string) => void;
  onProgressJson: (text: string) => void;
  onStartLoading: () => void;
  onExportProgress: () => void;
  onDownloadXml: () => void;
};

const ProjectToolbar: React.FC<Props> = ({
  entriesCount,
  hasXml,
  savedCount,
  totalCount,
  percent,
  onXml,
  onProgressJson,
  onStartLoading,
  onExportProgress,
  onDownloadXml,
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
          <Grid size="grow" />
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
        <Grid marginInline={2}>
          <Grid container justifyContent="space-between">
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
      )}
    </Grid>
  );
};

export default ProjectToolbar;
