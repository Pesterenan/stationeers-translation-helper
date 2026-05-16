import { Grid, Tooltip, Button, CircularProgress } from "@mui/material";
import type { IEntry } from "../../types";
import { useI18nContext } from "../../context/useI18nContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

interface IActionButtonProps {
  handleAutoTranslate: () => void;
  handleCopyOriginal: () => void;
  handleAccept: () => void;
  isTranslating: boolean;
  entry: IEntry;
}

const ActionButtons: React.FC<IActionButtonProps> = ({
  entry,
  handleAccept,
  handleCopyOriginal,
  handleAutoTranslate,
  isTranslating,
}) => {
  const { t } = useI18nContext();

  return (
    <Grid container gap={1} justifyContent="center" flexWrap="nowrap">
      <Tooltip title={t('translationItem.tooltipTranslate')}>
        <Button
          size="small"
          onClick={handleAutoTranslate}
          disabled={isTranslating}
          aria-label="traduzir"
          sx={{ minWidth: 32, height: 32, p: 0 }}
        >
          {isTranslating ? (
            <CircularProgress size={16} />
          ) : (
            <AutoFixHighIcon fontSize="small" />
          )}
        </Button>
      </Tooltip>
      <Tooltip title={t('translationItem.tooltipCopy')}>
        <Button
          size="small"
          onClick={handleCopyOriginal}
          aria-label="copiar original"
          sx={{ minWidth: 32, height: 32, p: 0 }}
        >
          <ContentCopyIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title={t('translationItem.tooltipAccept')}>
        <Button
          size="small"
          variant="contained"
          onClick={handleAccept}
          color={entry.status === "saved" ? "success" : "primary"}
          sx={{ minWidth: 32, height: 32, p: 0 }}
        >
          <CheckIcon fontSize="small" />
        </Button>
      </Tooltip>
    </Grid>
  );
};

export default ActionButtons;
