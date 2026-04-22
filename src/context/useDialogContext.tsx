import { createContext, useContext } from "react";

export type DialogType = "GOTO_PAGE" | "METADATA" | "CONFIG" | null;

export interface DialogContextType {
  activeDialog: DialogType;
  openDialog: (type: DialogType) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within DialogProvider");
  }
  return context;
}
