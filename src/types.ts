export type EntryStatus = "unchanged"| "edited"| "saved";

export interface Entry {
  id: string;
  key: string;
  original: string;
  translation?: string;
  savedTranslation?: string;
  status?: EntryStatus
}

export const DEFAULT_CATEGORY_RULES: Record<string, RegExp[]> = {
  tooltips: [/^StatusIcon/i, /^StatusIcon/, /^ScreenSpaceToolTips/, /^StatusIcon/],
  tips: [/Tip/i, /^Tip/, /Tip_/i],
  help: [/Help/i, /Help_/i],
  keys: [/^Key/i, /Key$/i],
  reagents: [/^Reagent_/i],
  ui: [/^UI_|^Ui_/i, /^Window_/i],
  other: [/.*/],
};


