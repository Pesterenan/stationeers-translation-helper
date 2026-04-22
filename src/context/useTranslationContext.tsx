import { createContext, useContext } from "react";
import type { Entry, IMetadata } from "../types";

interface TranslationContextType {
  // State
  activeSection: string;
  categories: Record<string, Entry[]>;
  entries: Entry[];
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
  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setShowAccepted: (hide: boolean) => void;
  setShowEmpty: (show: boolean) => void;

  // Actions
  acceptEntry: (id: string) => void;
  changeTab: (newValue: string) => void;
  downloadTranslatedXml: () => void;
  exportProgressJson: () => void;
  loadProgressJson: (jsonText: string) => void;
  loadXml: (text: string, fileName?: string, version?: string) => void;
  resetProject: () => void;
  updateEntry: (id: string, value: string) => void;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error(
      "useTranslationContext must be used within a TranslationProvider",
    );
  }
  return context;
}
