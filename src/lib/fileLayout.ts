export const FINAL_FILE_ORDER = ["main", "help", "keys", "tips", "tooltips"];

export const DEFAULT_HEADER_WRAPPERS = {
  code: 'Code',
  font: 'Font',
  language: 'Language',
  name: 'Name'
} as const;

export const ENTRY_WRAPPERS = {
  key: 'Key',
  record: 'Record',
  value: 'Value',
} as const;

export const DEFAULT_WRAPPERS_MAIN = {
  actions: "Actions",
  colors: "Colors",
  gameStrings: "GameStrings",
  gameTip: "GameTip",
  gases: "Gases",
  helpPage: "HelpPage",
  homePageButtonsOverride: "HomePageButtonsOverride",
  interactables: "Interactables",
  interface: "Interface",
  keys: "Keys",
  mineables: "Mineables",
  reagents: "Reagents",
  screenSpaceToolTips: "ScreenSpaceToolTips",
  slots: "Slots",
  thingPageOverride: "ThingPageOverride",
  things: "Things",
} as const;
