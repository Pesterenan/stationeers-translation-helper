import { useState, useCallback, type ReactNode } from "react";
import { type LocalStorageKey, PersistenceContext } from "./usePersistenceContext";
import type { IMetadata } from "../types";

export function PersistenceProvider({ children }: { children: ReactNode }) {
  const saveFileConfig = (metadata: IMetadata | null) => {
    if (metadata) {
      localStorage.setItem("sth_config", JSON.stringify(metadata));
    } else {
      localStorage.removeItem("sth_config");
    }
  };
  const loadFileConfig = (): IMetadata | null => {
    const savedConfig = localStorage.getItem('sth_config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (error) {
        console.error("Couldn't parse the saved file config.", error);
        return null;
      }
    }
    return null;
  };

  const saveDraft = (key: string, data: any) => {
    if (data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error("Couldn't save the current draft.", error);
      }
    }
  };

  const loadDraft = (key: string): any | null => {
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (error) {
        console.error("Couldn't parse the saved draft.", error);
        return null;
      }
    }
    return null;
  };

  const saveUiConfig = (key: LocalStorageKey, value: string) => {
    if (!key) return;
    localStorage.setItem(key, value);
  };

  const loadUiConfig = (key: LocalStorageKey) => {
    if (!key) return null;
    return localStorage.getItem(key);
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
