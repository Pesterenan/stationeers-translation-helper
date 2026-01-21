export type EntryStatus = "unchanged"| "edited"| "saved";

export interface Entry {
  id: string;
  key: string;
  original: string;
  translation?: string;
  savedTranslation?: string;
  status?: EntryStatus
}
