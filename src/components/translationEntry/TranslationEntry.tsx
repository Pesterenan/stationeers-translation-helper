import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Grid, CircularProgress, type GridSize } from "@mui/material";
import { useI18nContext } from "../../context/useI18nContext";
import { useTranslationContext } from "../../context/useTranslationContext";
import { useRegexHighlight } from "../../hooks/useRegexHighlight";
import { mapLanguageToCode, translateText } from "../../lib/translationService";
import type { IEntry } from "../../types";
import ActionButtons from "./ActionButtons";
import OriginalText from "./OriginalText";

interface IProps {
  entry: IEntry;
  index: number;
  onChange: (id: string, value: string) => void;
  onAccept: (id: string) => void;
}

/** Auxiliar grid component */
const TitledGridItem: React.FC<{ children: React.ReactNode; title: string, size: GridSize }> = ({ children, title, size }) => {
  return (
    <Grid paddingInline={1} size={size}>
      <Typography
        color="text.secondary"
        fontSize="0.65rem"
        fontWeight="bold"
        textTransform="uppercase"
        variant="caption"
      >
        {title}
      </Typography>
      {children}
    </Grid>
  );
};

const TranslationEntry: React.FC<IProps> = ({
  entry,
  index,
  onChange,
  onAccept,
}) => {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18nContext();
  const { showAccepted, metadata, compiledRegex } = useTranslationContext();
  const [translation, setTranslation] = useState(entry.translation ?? "");
  const [isTranslating, setIsTranslating] = useState(false);
  const matches = useRegexHighlight(entry.original, compiledRegex);

  const displayKey = entry.recordKey ?? entry.key;
  const subkeyLabel = entry.subkey ?? null;
  const shouldMultiline =
    (entry.subkey && ["Description", "Text"].includes(entry.subkey)) ||
    (entry.original?.length ?? 0) > 60;

  const handleCommitChange = useCallback(() => {
    if ((entry.translation ?? "") !== translation) {
      onChange(entry.id, translation);
    }
  }, [entry.id, entry.translation, translation, onChange]);

  const handleAccept = useCallback(() => {
    handleCommitChange();
    onAccept(entry.id);
  }, [handleCommitChange, onAccept, entry.id]);

  const handleAutoTranslate = useCallback(async () => {
    if (!entry.original || isTranslating) return;
    setIsTranslating(true);
    try {
      const targetLang = mapLanguageToCode(metadata?.Language, metadata?.Code);
      const translated = await translateText(entry.original, targetLang);
      setTranslation(translated);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    } catch (err) {
      console.error("Erro na tradução:", err);
    } finally {
      setIsTranslating(false);
    }
  }, [entry.original, isTranslating, metadata?.Language, metadata?.Code]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Tab") {
      const input = inputRef.current;
      if (input) {
        const currentEnd = input.selectionEnd;
        if (currentEnd) {
          const lastBracket = translation.indexOf('}', currentEnd);
          if (lastBracket !== -1) {
            e.preventDefault();
            input.setSelectionRange(lastBracket + 1, lastBracket + 1);
            return;
          }
        }
      }
    }
    if (e.altKey && (e.key === "t" || e.key === "T")) {
      e.preventDefault();
      handleAutoTranslate();
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "Enter":
        case "m":
          e.preventDefault();
          handleAccept();
          setTimeout(() => {
            // Se as aceitas estão sendo escondidas, o "próximo" item agora ocupa 
            // a posição do item atual (mesmo index). Caso contrário, pula pro próximo (+1).
            const nextIdx = !showAccepted ? index : index + 1;
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
        // Navigate to previous/next translation item
        case "j":
        case "k": {
          e.preventDefault();
          setTimeout(() => {
            const goToIndex = e.key === 'j' ? index + 1 : index - 1;
            const goToElement = document.getElementById(
              `translation-input-${goToIndex}`,
            );
            if (goToElement) {
              goToElement.focus();
            }
          }, 50);
          break;
        }
        // Tag completions:
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

  /** Copies original over to translation */
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

  useEffect(() => {
    setTranslation(entry.translation ?? "");
  }, [entry.translation]);

  return (
    <Grid
      alignItems="flex-start"
      container
      onKeyDown={handleKeyDown}
      padding={1}
      sx={{
        backgroundColor: entry.status === "edited"
          ? alpha(
            theme.palette.warning.main,
            theme.palette.mode === "dark" ? 0.16 : 0.12
          )
          : entry.status === "saved"
            ? alpha(
              theme.palette.success.main,
              theme.palette.mode === "dark" ? 0.16 : 0.12
            )
            : "transparent",
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Coluna 1: Key & Subkey */}
      <TitledGridItem title={t('translationItem.key')} size={2}>
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
      </TitledGridItem>

      {/* Coluna 2: Original Text */}
      <TitledGridItem title={t('translationItem.original')} size='grow'>
        <OriginalText
          id={index !== undefined ? `original-text-${index}` : undefined}
          text={entry.original ?? ""}
          matches={matches || []}
          onTagClick={handleTagClick}
        />
      </TitledGridItem>

      {/* Coluna 3: Translation Input */}
      <TitledGridItem title={t('translationItem.translation')} size='grow'>
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
          onBlur={handleCommitChange}
          size="small"
          variant="outlined"
          disabled={isTranslating}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.5)
                  : "white",
            },
          }}
          slotProps={{
            input: {
              endAdornment: isTranslating && (
                <CircularProgress size={20} color="inherit" />
              ),
            }
          }}
        />
      </TitledGridItem>

      {/* Coluna 4: Actions */}
      <TitledGridItem title={t('translationItem.actions')} size={1.5}>
        <ActionButtons
          entry={entry}
          handleAccept={handleAccept}
          handleCopyOriginal={handleCopyOriginal}
          handleAutoTranslate={handleAutoTranslate}
          isTranslating={isTranslating}
        />
      </TitledGridItem>
    </Grid>
  );
};

export default React.memo(TranslationEntry);
