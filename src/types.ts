export type EntryStatus = "unchanged" | "edited" | "saved";

export interface Entry {
  id: string;
  key: string;
  original: string;
  translation?: string;
  savedTranslation?: string;
  status?: EntryStatus;
  section?: string;
  subkey?: string | null;
  selector?: string;
}

export const DEFAULT_CATEGORY_RULES: Record<string, RegExp[]> = {
  tooltips: [/^ScreenSpaceToolTip_/],
  tips: [/^Interface_/],
  help: [/^Help_/],
  keys: [/^Key_.*_(page\d)$/],
  reagents: [/^Reagent_/],
  ui: [/^UI_|^Ui_/, /^Window_/],
  other: [/.*/],
};

export interface IMetadata {
  Language?: string;
  Code?: string;
  Font?: string;
}
