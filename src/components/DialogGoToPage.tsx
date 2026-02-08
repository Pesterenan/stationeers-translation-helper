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
import { useTranslationContext } from "../context/TranslationContext";

const DialogGoToPage = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { page, setPage, totalPages } = useTranslationContext();
  const [currentPage, setCurrentPage] = React.useState(page ?? 0);
  const handleGoToPage = () => {
    if (currentPage > 0 && currentPage !== page) {
      setPage(currentPage > totalPages ? totalPages : currentPage);
    }
  };
  const handleDialogClose = (): void => {
  }

  return (
    <Dialog open>
      <DialogContent>
        <Grid alignItems="center" container flexWrap="nowrap" gap={2}>
          <Typography>Ir para página:</Typography>
          <TextField
            autoFocus
            margin="none"
            onChange={(event) => setCurrentPage(Number(event.target.value))}
            size="small"
            slotProps={{ htmlInput: { min: 1, max: totalPages, tabIndex: 0 } }}
            type="number"
            value={currentPage > 0 ? currentPage : ""}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} tabIndex={2}>Cancelar</Button>
        <Button disabled={!currentPage} onClick={handleGoToPage} tabIndex={1} variant="contained">
          Ir
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DialogGoToPage;
