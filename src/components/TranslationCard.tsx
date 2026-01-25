import React, { useEffect, useState, useCallback } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import type { Entry } from "../types";

type Props = {
  entry: Entry;
  onChange: (key: string, value: string) => void;
  onAccept: (key: string) => void;
};

const TranslationCardInner: React.FC<Props> = ({ entry, onChange, onAccept }) => {
  const theme = useTheme();

  // Use recordKey if available, otherwise fallback to parsing key or full key
  const displayKey = entry.recordKey ?? entry.key;
  const subkeyLabel = entry.subkey ?? null;

  // local buffer for smooth typing
  const [translation, setTranslation] = useState(entry.translation ?? "");

  // Update local state if prop changes (e.g. from JSON import)
  useEffect(() => {
    setTranslation(entry.translation ?? "");
  }, [entry.translation]);

  // background by status using theme
  const backgroundColor =
    entry.status === "edited"
      ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.16 : 0.12)
      : entry.status === "saved"
      ? alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.16 : 0.12)
      : "transparent";

  // decide if should be multiline (descriptions / text or long original)
  const shouldMultiline =
    (entry.subkey && ["Description", "Text"].includes(entry.subkey)) || (entry.original?.length ?? 0) > 60;

  const commitChange = useCallback(() => {
    // only call onChange when value actually differs from entry.translation
    if ((entry.translation ?? "") !== translation) {
      onChange(entry.key, translation);
    }
  }, [entry.key, entry.translation, translation, onChange]);

  const handleAccept = useCallback(() => {
    commitChange();
    onAccept(entry.key);
  }, [commitChange, onAccept, entry.key]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    // Ctrl/Cmd + Enter to accept
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAccept();
    }
  };

  const handleCopyOriginal = useCallback(() => {
    setTranslation(entry.original ?? "");
    // don't immediately commit — user may edit; but could also commit if you prefer:
    // onChange(entry.key, entry.original ?? "");
  }, [entry.original]);

  return (
    <Card variant="elevation" sx={{ backgroundColor, transition: "background-color 0.2s ease" }}>
      <CardContent>
        <Grid container alignItems="center" spacing={1}>
          <Grid size="auto" sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.5 }}>
              <Typography component="span" fontWeight="bold" variant="body2">
                {displayKey}
              </Typography>
              {subkeyLabel && (
                <Typography component="span" variant="caption" sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: 'action.hover', 
                    px: 0.5, 
                    borderRadius: 1 
                }}>
                  {subkeyLabel}
                </Typography>
              )}
            </Box>
            <Typography component="div" variant="caption" color="text.secondary">
              {entry.section} &bull; {entry.tagName}
            </Typography>
          </Grid>

          <Grid>
            <Tooltip title="Copiar original para o campo">
              <Button size="small" onClick={handleCopyOriginal} aria-label="copiar original" sx={{ minWidth: 32 }}>
                <ContentCopyIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Original
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
            {entry.original}
          </Typography>
        </Box>

        <Grid container alignItems="center" spacing={1} sx={{ mt: 1 }} onKeyDown={handleKeyDown}>
          <Grid size="grow">
            <TextField
              fullWidth
              multiline={shouldMultiline}
              minRows={shouldMultiline ? 3 : 1}
              label="Tradução"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              onBlur={commitChange}
              size="small"
            />
          </Grid>

          <Grid>
            <Tooltip title="Aceitar (Ctrl/Cmd + Enter)">
              <Button
                size="small"
                variant="contained"
                onClick={handleAccept}
                sx={{ minWidth: 40, p: 1 }}
              >
                <CheckIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const TranslationCard = React.memo(TranslationCardInner);
export default TranslationCard;