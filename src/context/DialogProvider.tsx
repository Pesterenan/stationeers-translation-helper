import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DialogContext, type DialogType } from "./useDialogContext";

export function DialogProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const openDialog = useCallback((type: DialogType) => {
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
