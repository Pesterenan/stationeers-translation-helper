import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import type { Entry } from "../types";
import { Badge, Grid } from "@mui/material";
import { useTranslationContext } from "../context/TranslationContext";

type Props = {
  entry: Entry;
  index: number; // Agora obrigatório para navegação correta
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
      whiteSpace="pre-wrap"
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

const TranslationItemInner: React.FC<Props> = ({
  entry,
  index,
  onChange,
  onAccept,
}) => {
  const theme = useTheme();
  const { hideAccepted } = useTranslationContext();
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
          
          setTimeout(() => {
            // Se as aceitas estão sendo escondidas, o "próximo" item agora ocupa 
            // a posição do item atual (mesmo index). Caso contrário, pula pro próximo (+1).
            const nextIdx = hideAccepted ? index : index + 1;
            const nextElement = document.getElementById(
              `translation-input-${nextIdx}`,
            );
            if (nextElement) {
              nextElement.focus();
            }
          }, 50); // Delay curto para dar tempo de re-renderizar a lista filtrada
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

  return (
    <Grid
      alignItems="flex-start"
      container
      onKeyDown={handleKeyDown}
      padding={1}
      sx={{
        backgroundColor,
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Coluna 1: Key & Subkey */}
      <Grid paddingInline={1} size={2}>
        <Typography
          color="text.secondary"
          fontSize="0.65rem"
          fontWeight="bold"
          textTransform="uppercase"
          variant="caption"
        >
          Chave:
        </Typography>
        <Grid container justifyContent="space-between">
          <Typography
            fontWeight="bold"
            variant="body2"
            sx={{
              wordBreak: "break-all",
              lineHeight: 1.2,
            }}
          >
            {displayKey}
          </Typography>
          {subkeyLabel && (
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                bgcolor: "action.selected",
                px: 0.5,
                borderRadius: 1,
                alignSelf: "flex-start",
              }}
            >
              {subkeyLabel}
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Coluna 2: Original Text */}
      <Grid paddingInline={1} size="grow">
        <Typography
          color="text.secondary"
          fontSize="0.65rem"
          fontWeight="bold"
          textTransform="uppercase"
          variant="caption"
        >
          Original:
        </Typography>
        <OriginalTextDisplay
          id={index !== undefined ? `original-text-${index}` : undefined}
          text={entry.original ?? ""}
          onTagClick={handleTagClick}
        />
      </Grid>

      {/* Coluna 3: Translation Input */}
      <Grid container paddingInline={1} size="grow">
        <Typography
          color="text.secondary"
          fontSize="0.65rem"
          fontWeight="bold"
          textTransform="uppercase"
          variant="caption"
        >
          Tradução:
        </Typography>
        <TextField
          id={index !== undefined ? `translation-input-${index}` : undefined}
          inputRef={inputRef}
          fullWidth
          multiline={shouldMultiline}
          minRows={1}
          maxRows={10}
          placeholder="..."
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          onBlur={commitChange}
          size="small"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.5)
                  : "white",
            },
          }}
        />
      </Grid>

      {/* Coluna 4: Actions */}
      <Grid paddingInline={1} size={1}>
        <Typography
          color="text.secondary"
          fontSize="0.65rem"
          fontWeight="bold"
          textTransform="uppercase"
          variant="caption"
        >
          Ações:
        </Typography>
        <Grid container gap={2} justifyContent="center">
          <Tooltip title="Copiar original para o campo (Ctrl+Shift+C)">
            <Button
              size="small"
              onClick={handleCopyOriginal}
              aria-label="copiar original"
              sx={{ minWidth: 40, height: 40 }}
            >
              <ContentCopyIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Aceitar (Ctrl/Cmd + Enter)">
            <Button
              size="small"
              variant="contained"
              onClick={handleAccept}
              color={entry.status === "saved" ? "success" : "primary"}
              sx={{ minWidth: 40, height: 40 }}
            >
              <CheckIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
};

const TranslationItem = React.memo(TranslationItemInner);
export default TranslationItem;
