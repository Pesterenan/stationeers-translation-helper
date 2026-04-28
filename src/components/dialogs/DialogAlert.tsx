import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useDialogContext } from "../../context/useDialogContext";

const DialogAlert = () => {
  const { activeDialog, alertConfig, closeDialog } = useDialogContext();

  const isOpen = activeDialog === "ALERT" && !!alertConfig;

  const handleAlertDismiss = () => {
    if (alertConfig?.resolve) {
      alertConfig.resolve(true);
    }
    closeDialog();
  };

  if (!alertConfig) return null;

  return (
    <Dialog open={isOpen} onClose={handleAlertDismiss}>
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
          color="success"
          onClick={handleAlertDismiss}
          tabIndex={1}
          variant="contained"
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAlert;
