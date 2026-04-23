export const en = {
  app: {
    title: "Stationeers Translation Helper",
    subtitle: "Import the original game XML file, edit translations and export the new XML",
    loading: "Processing file...",
  },
  toolbar: {
    import: "Import XML / JSON",
    settings: "Project Settings",
    saveProgress: "Save Progress",
    downloadXml: "Download XML",
    searchPlaceholder: "Search",
    searchTooltip: "Type more than 3 letters of what you are looking for to search",
    showAccepted: "Show accepted entries",
    showEmpty: "Show empty entries",
    totalProgress: "Total Progress",
    draftSaved: "Draft saved at",
  },
  dialogConfig: {
    title: "Project Settings",
    description: "Adjust XML file metadata and export settings.",
    uiLanguageLabel: "Interface Language",
    languageLabel: "Language Name (Ex: Portuguese)",
    codeLabel: "Language Code (Ex: pb)",
    fontLabel: "Font (Character Set)",
    originalFileLabel: "Master File (Draft ID)",
    originalFileHelper: "This name identifies your draft in the browser. Do not change it manually.",
    exportFileLabel: "Exported File Name (Ex: portuguese.xml)",
    exportFileHelper: "If empty, will use default name based on the language.",
    resetProject: "Reset Project",
    cancel: "Cancel",
    save: "Save Settings",
  },
  dialogGoToPage: {
    title: "Go to page:",
    of: "of",
    cancel: "Cancel",
    go: "Go",
  },
  importer: {
    errorPrefix: "Only original game files (starting with 'english') or progress files 'english_progress.json' are allowed.",
    errorUnknown: "Unknown file type. Use .xml or .json",
  },
  messages: {
    xmlError: "Error parsing XML:",
    jsonError: "Error importing JSON progress:",
    exportError: "Error generating translated XML:",
    draftRecovered: "Draft for {lang} recovered from LocalStorage.",
    noXml: "No XML loaded",
    confirmReset: "This will clear the language settings and the loaded file. Do you want to continue?",
  },
  translationItem: {
    key: "Key:",
    original: "Original:",
    translation: "Translation:",
    actions: "Actions:",
    tooltipTranslate: "Translate automatically (Alt+T)",
    tooltipCopy: "Copy original to field (Ctrl+Shift+C)",
    tooltipAccept: "Accept (Ctrl/Cmd + Enter or Ctrl+M)",
  }
} as const;

export type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeys<T[K]>}` : K;
}[keyof T & string];
export type TranslationKeys = NestedKeys<typeof en>;
