import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DialogContext, type IAlertConfig, type TDialogType } from "./useDialogContext";

export function DialogProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<TDialogType>(null);

  const openDialog = useCallback((type: TDialogType) => {
    setActiveDialog(type);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const value = useMemo(
    () => ({ activeDialog, openDialog, closeDialog }),
    [activeDialog, openDialog, closeDialog]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}
