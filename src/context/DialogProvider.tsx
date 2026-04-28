import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DialogContext, type IAlertConfig, type TDialogType } from "./useDialogContext";

export function DialogProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<TDialogType>(null);
  const [alertConfig, setAlertConfig] = useState<IAlertConfig | null>(null);

  const openDialog = useCallback((type: TDialogType) => {
    setActiveDialog(type);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setAlertConfig(null);
  }, []);

  const showAlert = useCallback((title: string, content: React.ReactNode) => {
    return new Promise<void>((resolve) => {
      setAlertConfig({ title, content, resolve });
      setActiveDialog("ALERT");
    });
  }, []);

  const value = useMemo(
    () => ({ activeDialog, alertConfig, openDialog, closeDialog, showAlert }),
    [activeDialog, alertConfig, openDialog, closeDialog, showAlert]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}
