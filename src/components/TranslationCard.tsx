import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { Badge } from "@mui/material";

type Props = {
  entry: Entry;
  index?: number; // Índice relativo à página atual (para navegação de foco)
  onChange: (id: string, value: string) => void;
  onAccept: (id: string) => void;
};

const shortcuts = ["y", "u", "i", "o", "p", "Y", "U", "I", "O", "P"];

/**
 * Componente interno para renderizar o texto original com tags clicáveis
 */
const OriginalTextDisplay: React.FC<{
  id?: string;
  text: string;
  onTagClick: (tag: string) => void;
}> = ({ id, text, onTagClick }) => {
  if (!text) return null;

  // Regex para capturar tags como {LINK:Page;Text}, {THING:Prefab}, {LIST_OF_RESOURCES}, etc.
  // Suporta tags com ou sem dois pontos.
  const underscoredWords = "(\\{(?:[A-Z_]+)(?::[^}]*)?\\})";
  const htmlTags = "(<(?:size|color)=(?::\\d+|\\w+)%?>|</(?:size|color)>)";
  const finalRegex = new RegExp(`${underscoredWords}|${htmlTags}`, "g");
  const parts = text.split(finalRegex).filter(Boolean);
  let shortcutIndex = 0;

  return (
    <Typography
      variant="body2"
      sx={{ whiteSpace: "pre-wrap", mt: 0.5, lineHeight: 1.6 }}
    >
      {parts.map((part, i) => {
        if (
          (part.startsWith("{") && part.endsWith("}")) ||
          (part.startsWith("<") && part.endsWith(">"))
        ) {
          const shortcut = shortcuts[shortcutIndex++];
          return (
            <Badge
              anchorOrigin={{ horizontal: "left", vertical: "top" }}
              badgeContent={shortcut}
              color="info"
              sx={{ ml: 1 }}
            >
              <Box
                id={`${id}-tag-${shortcut}`}
                component="span"
                onClick={() => onTagClick(part)}
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  borderRadius: 1,
                  color: "primary.main",
                  cursor: "pointer",
                  display: "inline-block",
                  fontWeight: "bold",
                  marginInline: 0.2,
                  paddingInline: 0.5,
                  textDecoration: "underline",
                  verticalAlign: "middle",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    color: "primary.dark",
                  },
                }}
              >
                {part}
              </Box>
            </Badge>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </Typography>
  );
};

const TranslationCardInner: React.FC<Props> = ({
  entry,
  index,
  onChange,
  onAccept,
}) => {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

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
      ? alpha(
          theme.palette.warning.main,
          theme.palette.mode === "dark" ? 0.16 : 0.12,
        )
      : entry.status === "saved"
        ? alpha(
            theme.palette.success.main,
            theme.palette.mode === "dark" ? 0.16 : 0.12,
          )
        : "transparent";

  // decide if should be multiline (descriptions / text or long original)
  const shouldMultiline =
    (entry.subkey && ["Description", "Text"].includes(entry.subkey)) ||
    (entry.original?.length ?? 0) > 60;

  const commitChange = useCallback(() => {
    // only call onChange when value actually differs from entry.translation
    if ((entry.translation ?? "") !== translation) {
      onChange(entry.id, translation);
    }
  }, [entry.id, entry.translation, translation, onChange]);

  const handleAccept = useCallback(() => {
    commitChange();
    onAccept(entry.id);
  }, [commitChange, onAccept, entry.id]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "Enter":
        case "m":
          e.preventDefault();
          handleAccept();
          if (index !== undefined) {
            setTimeout(() => {
              const nextElement = document.getElementById(`translation-input-${index + 1}`);
              if (nextElement) {
                nextElement.focus();
              }
            }, 0);
          }
          break;
        case "h": {
          e.preventDefault();
          const input = inputRef.current;
          if (input) {
            const start = input.selectionStart ?? translation.length;
            const end = input.selectionEnd ?? translation.length;
            const newText =
              translation.substring(0, start - 1) + translation.substring(end);

            setTranslation(newText);

            // Re-focar e posicionar cursor ou seleção após a tag inserida
            setTimeout(() => {
              input.focus();
              input.setSelectionRange(start - 1, end - 1);
            }, 0);
          }
          break;
        }
        case "y":
        case "u":
        case "i":
        case "o":
        case "p":
        case "Y":
        case "U":
        case "I":
        case "O":
        case "P": {
          e.preventDefault();
          const tag = document.getElementById(
            `original-text-${index}-tag-${e.key}`,
          );
          if (tag?.textContent) {
            handleTagClick(tag.textContent);
            const input = inputRef.current;
            if (input) {
              input.focus();
            }
          }
          break;
        }
        case "C":
          e.preventDefault();
          handleCopyOriginal();
          break;
        default:
          break;
      }
    }
  };

  const handleCopyOriginal = useCallback(() => {
    setTranslation(entry.original ?? "");
  }, [entry.original]);

  const handleTagClick = useCallback(
    (tag: string) => {
      const input = inputRef.current;
      if (input) {
        const start = input.selectionStart ?? translation.length;
        const end = input.selectionEnd ?? translation.length;
        const newText =
          translation.substring(0, start) + tag + translation.substring(end);

        setTranslation(newText);

        // Re-focar e posicionar cursor ou seleção após a tag inserida
        setTimeout(() => {
          input.focus();

          // Verifica se a tag tem a parte traduzível (após o ponto e vírgula)
          // Ex: {LINK:ConstructionPage;Construction}
          const semiIndex = tag.indexOf(";");
          if (semiIndex !== -1) {
            // Selecionar o texto entre o ';' e o '}'
            const selStart = start + semiIndex + 1;
            const selEnd = start + tag.length - 1;
            input.setSelectionRange(selStart, selEnd);
          } else {
            // Caso contrário, apenas move o cursor para o fim da tag
            const newPos = start + tag.length;
            input.setSelectionRange(newPos, newPos);
          }
        }, 0);
      } else {
        setTranslation((prev) => prev + tag);
      }
    },
    [translation],
  );

  return (
    <Card
      variant="elevation"
      sx={{ backgroundColor, transition: "background-color 0.2s ease" }}
    >
      <CardContent>
        <Grid container alignItems="center" spacing={1}>
          <Grid size="auto" sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              <Typography component="span" fontWeight="bold" variant="body2">
                {displayKey}
              </Typography>
              {subkeyLabel && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: "action.hover",
                    px: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {subkeyLabel}
                </Typography>
              )}
            </Box>
            <Typography
              component="div"
              variant="caption"
              color="text.secondary"
            >
              {entry.section} &bull; {entry.tagName}
            </Typography>
          </Grid>

          <Grid>
            <Tooltip title="Copiar original para o campo">
              <Button
                size="small"
                onClick={handleCopyOriginal}
                aria-label="copiar original"
                sx={{ minWidth: 32 }}
              >
                <ContentCopyIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Original
          </Typography>
          <OriginalTextDisplay
            id={index !== undefined ? `original-text-${index}` : undefined}
            text={entry.original ?? ""}
            onTagClick={handleTagClick}
          />
        </Box>

        <Grid
          container
          alignItems="center"
          spacing={1}
          sx={{ mt: 1 }}
          onKeyDown={handleKeyDown}
        >
          <Grid size="grow">
            <TextField
              id={
                index !== undefined ? `translation-input-${index}` : undefined
              }
              inputRef={inputRef}
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
            <Tooltip title="Aceitar (Ctrl/Cmd + M/Enter)">
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
