import { type ReactNode } from "react";
import { PersistenceContext } from "./usePersistenceContext";
import type { IMetadata } from "../types";
import { STORAGE_KEYS, type StorageKey } from "../constants";
import { setItemJSON, getItemJSON, setItemString, getItemString } from "../lib/persistenceHelpers";

export function PersistenceProvider({ children }: { children: ReactNode }) {
  const loadFileConfig = (): IMetadata | null => getItemJSON<IMetadata>(STORAGE_KEYS.CONFIG);
  const saveFileConfig = (metadata: IMetadata | null) => setItemJSON(STORAGE_KEYS.CONFIG, metadata);

  const loadDraft = (key: string): any | null => getItemJSON(key);
  const saveDraft = (key: string, data: any) => setItemJSON(key, data);

  const loadUiConfig = (key: StorageKey) => {
    if (!key) return null;
    return getItemString(STORAGE_KEYS[key]);
  };

  const saveUiConfig = (key: StorageKey, value: string) => {
    if (!key) return;
    setItemString(STORAGE_KEYS[key], value);
  };

  return (
    <PersistenceContext.Provider value={{
      loadDraft,
      loadFileConfig,
      loadUiConfig,
      saveDraft,
      saveFileConfig,
      saveUiConfig,
    }}>
      {children}
    </PersistenceContext.Provider>
  );
}
