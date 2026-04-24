import React, { useRef } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
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
import { useDialogContext } from "../context/useDialogContext";
import { useI18nContext } from "../context/useI18nContext";
import { useTranslationContext } from "../context/useTranslationContext";

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
  const { openDialog } = useDialogContext();
  const { t } = useI18nContext();

  const theme = useTheme();

  const searchTimeoutId = useRef<number | undefined>(undefined);
  const [localSearchText, setLocalSearchText] = React.useState(searchTerm || "");
  const [loadingSearch, setLoadingSearch] = React.useState(false);

  React.useEffect(() => {
    clearTimeout(searchTimeoutId.current);
    if (!localSearchText.length) {
      setLoadingSearch(false);
      setSearchTerm(localSearchText);
      return;
    }

    setLoadingSearch(true);
    searchTimeoutId.current = setTimeout(() => {
      setLoadingSearch(false);
      setSearchTerm(localSearchText);
    }, 500);

    return () => clearTimeout(searchTimeoutId.current);
  }, [localSearchText, setSearchTerm]);

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
          alignItems="center"
          container
          gap={1}
          justifyContent="space-between"
          padding={2}
          size="grow"
        >
          <FileImporter
            onXml={loadXml}
            onProgressJson={loadProgressJson}
            onStart={() => { }}
          />
          {/* Metadata & Config */}
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => openDialog("CONFIG")}
          >
            {t('toolbar.settings')}
          </Button>

          <Button
            variant="outlined"
            onClick={exportProgressJson}
            disabled={entries.length === 0}
          >
            {t('toolbar.saveProgress')}
          </Button>
          <Button
            variant="contained"
            onClick={downloadTranslatedXml}
            disabled={!xmlDoc}
          >
            {t('toolbar.downloadXml')}
          </Button>
        </Grid>
      </Paper>

      {/* Global Progress */}
      {entries.length > 0 && (
        <Grid
          container
          flexDirection={{ xs: "column", lg: "row" }}
          gap={{ xs: 2, lg: 0 }}
          flexWrap="nowrap"
          alignItems="center"
          paddingInline={2}
        >
          <Grid container alignItems="center" gap={2} 
          flexWrap="nowrap"
          size={{ xs: 12, lg: "grow" }}>
            <TextField
              id="search"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('toolbar.searchTooltip')}>
                        {loadingSearch ? <CircularProgress size={20} /> : <Search />}
                      </Tooltip>
                    </InputAdornment>
                  ),
                  placeholder: t('toolbar.searchPlaceholder'),
                  size: "small",
                  sx: { borderRadius: "100px", width: 250 },
                },
              }}
              onChange={(event) => setLocalSearchText(event.currentTarget.value)}
              value={localSearchText}
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
                  {t('toolbar.showAccepted')}
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
                  {t('toolbar.showEmpty')}
                </Typography>
              }
            />
          </Grid>
          <Grid container flexDirection="column" size={{ xs: 12, lg: "grow" }} paddingInline={2}>
            <Grid container flexDirection="row" justifyContent="space-between">
              <Typography variant="caption" fontWeight="bold">
                {t('toolbar.totalProgress')}
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
                {t('toolbar.draftSaved')} {lastAutoSave.toLocaleTimeString()}
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectToolbar;
