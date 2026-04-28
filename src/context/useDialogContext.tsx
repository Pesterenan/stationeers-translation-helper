import { createContext, useContext } from "react";

export type TDialogType = "ALERT" | "GOTO_PAGE" | "METADATA" | "CONFIG" | null;

export interface IAlertConfig {
  title: React.ReactNode;
  content: React.ReactNode;
  resolve: () => void;
}

export interface IDialogContextType {
  activeDialog: TDialogType;
  alertConfig: IAlertConfig | null;
  openDialog: (type: TDialogType) => void;
  closeDialog: () => void;
  showAlert: (title: string, content: React.ReactNode) => Promise<void>;
}

export const DialogContext = createContext<IDialogContextType | undefined>(undefined);

export function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within DialogProvider");
  }
  return context;
}
