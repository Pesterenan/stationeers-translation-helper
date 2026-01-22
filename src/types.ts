export type EntryStatus = "unchanged" | "edited" | "saved";

export interface Entry {
  id: string;
  key: string;
  original: string;
  translation?: string;
  savedTranslation?: string;
  status?: EntryStatus;
}

export const DEFAULT_CATEGORY_RULES: Record<string, RegExp[]> = {
  tooltips: [/^ScreenSpaceToolTip/],
  tips: [/^Interface_/],
  help: [/^Help_/],
  keys: [/^Key_.*(page\d)$/],
  reagents: [/^Reagent_/],
  ui: [/^UI_|^Ui_/, /^Window_/],
};

export interface IMetadata {
  Language?: string;
  Code?: string;
  Font?: string;
}
