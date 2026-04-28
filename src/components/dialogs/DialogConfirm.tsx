import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useDialogContext } from "../../context/useDialogContext";

const DialogConfirm = () => {
  const { activeDialog, alertConfig, closeDialog } = useDialogContext();

  const isOpen = activeDialog === "CONFIRM" && !!alertConfig;

  const handleConfirm = (value: boolean) => {
    if (alertConfig?.resolve) {
      alertConfig.resolve(value);
    }
    closeDialog();
  };

  if (!alertConfig) return null;

  return (
    <Dialog open={isOpen} onClose={() => handleConfirm(false)}>
      <DialogTitle>
        {alertConfig.title}
      </DialogTitle>
      <DialogContent>
        <Grid alignItems="center" container flexWrap="nowrap" gap={2}>
          {alertConfig.content}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          color="inherit"
          onClick={() => handleConfirm(false)}
        >
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={() => handleConfirm(true)}
          variant="contained"
          autoFocus
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogConfirm;
