
import { createContext, useContext } from "react";
import type { IMetadata } from "../types";
import type { StorageKey } from "../constants";

interface IPersistenceContext {
  saveFileConfig: (metadata: IMetadata | null) => void;
  loadFileConfig: () => IMetadata | null;
  saveDraft: (key: string, data: any) => void;
  loadDraft: (key: string) => any | null;
  saveUiConfig: (key: StorageKey, value: string) => void;
  loadUiConfig: (key: StorageKey) => string | null;
}

export const PersistenceContext = createContext<IPersistenceContext | undefined>(undefined);

export function usePersistenceContext() {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error("usePersistence must be used within an PersistenceProvider");
  }
  return context;
}
