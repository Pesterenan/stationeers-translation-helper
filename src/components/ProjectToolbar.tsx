import React from "react";
import { Box, Button, Paper, Typography, LinearProgress, linearProgressClasses, useTheme } from "@mui/material";
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
    <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Actions Toolbar */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FileImporter
          onXml={onXml}
          onProgressJson={onProgressJson}
          onStart={onStartLoading}
        />

        <Box sx={{ flexGrow: 1 }} />

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
      </Paper>

      {/* Global Progress */}
      <Box sx={{ mt: 1 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
        >
          <Typography variant="caption" fontWeight="bold">
            Progresso Total
          </Typography>
          <Typography variant="caption">
            {savedCount} / {totalCount} ({percent}%)
          </Typography>
        </Box>
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
      </Box>
    </Box>
  );
};

export default ProjectToolbar;
