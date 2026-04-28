import { createContext, useContext } from "react";
import type { IEntry, IMetadata } from "../types";

  // State
export interface ITranslationContextType {
  activeSection: string;
  categories: Record<string, IEntry[]>;
  entries: IEntry[];
  isLoading: boolean;
  metadata: IMetadata | undefined;
  page: number;
  searchTerm: string;
  showAccepted: boolean;
  showEmpty: boolean;
  sections: string[];
  xmlDoc: XMLDocument | null;
  sourceVersion: string | null;
  lastAutoSave: Date | null;

  // Stats
  percent: number;
  savedCount: number;
  total: number;
  totalPages: number;

  // Setters
  setMetadata: (meta: IMetadata) => void;
  setPage: (p: number) => void;
  setSearchTerm: (term: string) => void;
  // Actions
  setShowAccepted: (val: boolean) => void;
  setShowEmpty: (val: boolean) => void;
  acceptEntry: (id: string) => void;
  changeTab: (newValue: string) => void;
  downloadTranslatedXml: () => void;
  exportProgressJson: () => void;
  loadProgressJson: (json: string) => void;
  loadXml: (text: string, fileName?: string, version?: string) => void;
  resetProject: () => void;
  updateEntry: (id: string, value: string) => void;
}

export const TranslationContext = createContext<ITranslationContextType | undefined>(
  undefined,
);

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslationContext must be used within TranslationProvider",
    );
  }
  return context;
}
