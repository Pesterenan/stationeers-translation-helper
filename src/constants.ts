// Listas de RegExp para categorização automática na UI (Filtros)
export const DEFAULT_CATEGORY_RULES: Record<string, RegExp[]> = {
  tooltips: [/^ScreenSpaceToolTip/, /^StatusIcon/],
  tips: [/^GameTip/],
  help: [/^Help_/, /^Stationpedia/],
  reagents: [/^Reagent_/],
  things: [/^Thing_/, /^Appliance/, /^Item/, /^Structure/], // Exemplo baseado em prefixos comuns
  ui: [/^UI_|^Ui_/, /^Window_/, /^Inventory/],
  other: [/.*/],
};

// Regex para capturar tags como {LINK:Page;Text}, {THING:Prefab}, {LIST_OF_RESOURCES}, etc.
const UNDERSCORED_WORDS = "(\\{(?:[A-Z_]+)(?::[^}]*)?\\})";
const HTML_TAGS = "(<(?:size|color)=(?::\\d+|\\w+)%?>|</(?:size|color)>)";
// Esta regex é usada apenas para identificar e separar as tags, não para destacar ranges.
export const TAG_EXTRACTION_REGEX = new RegExp(`${UNDERSCORED_WORDS}|${HTML_TAGS}`, "g");

export const TAG_SHORTCUTS = ["y", "u", "i", "o", "p", "Y", "U", "I", "O", "P"];

