import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useDialogContext } from "../../context/useDialogContext";
import { useTranslationContext } from "../../context/useTranslationContext";
import { useI18nContext } from "../../context/useI18nContext";

const DialogGoToPage = () => {
  const { activeDialog, closeDialog } = useDialogContext();
  const { page, setPage, totalPages } = useTranslationContext();
  const { t } = useI18nContext();
  const [currentPage, setCurrentPage] = React.useState(page);

  const isOpen = activeDialog === "GOTO_PAGE";

  React.useEffect(() => {
    if (isOpen) {
      setCurrentPage(page);
    }
  }, [isOpen, page]);

  const handleGoToPage = () => {
    if (currentPage > 0 && currentPage !== page) {
      setPage(currentPage > totalPages ? totalPages : currentPage);
    }
    closeDialog();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && currentPage > 0) {
      handleGoToPage();
    }
  };

  return (
    <Dialog open={isOpen} onClose={closeDialog}>
      <DialogContent onKeyDown={handleKeyDown}>
        <Grid alignItems="center" container flexWrap="nowrap" gap={2}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{t('dialogGoToPage.title')}</Typography>
          <TextField
            autoFocus
            margin="none"
            onChange={(event) => setCurrentPage(Number(event.target.value))}
            size="small"
            slotProps={{
              htmlInput: {
                min: 1,
                max: totalPages,
                tabIndex: 0,
              },
            }}
            type="number"
            value={currentPage > 0 ? currentPage : ""}
          />
          <Typography color="text.secondary" variant="body2">
            {t('dialogGoToPage.of')} {totalPages}
          </Typography>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={closeDialog} tabIndex={2}>
          {t('dialogGoToPage.cancel')}
        </Button>
        <Button
          color="success"
          disabled={!currentPage || currentPage < 1}
          onClick={handleGoToPage}
          tabIndex={1}
          variant="contained"
        >
          {t('dialogGoToPage.go')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DialogGoToPage;
