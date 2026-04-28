import { createContext, useContext } from "react";

export type TDialogType = "ALERT" | "CONFIRM" | "GOTO_PAGE" | "METADATA" | "CONFIG" | null;

export interface IAlertConfig {
  title: string;
  content: React.ReactNode;
  resolve: (value: boolean) => void;
}

export interface IDialogContextType {
  activeDialog: TDialogType;
  alertConfig: IAlertConfig | null;
  openDialog: (type: TDialogType) => void;
  closeDialog: () => void;
  showAlert: (title: string, content: React.ReactNode) => Promise<void>;
  showConfirm: (title: string, content: React.ReactNode) => Promise<boolean>;
}

export const DialogContext = createContext<IDialogContextType | undefined>(undefined);

export function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within DialogProvider");
  }
  return context;
}
