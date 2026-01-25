export type EntryStatus = "unchanged" | "edited" | "saved";

/**
 * Representa uma unidade atômica de tradução na UI.
 * Diferente da estrutura do XML (onde um Record pode ter Value e Description),
 * aqui separamos cada campo de texto em uma Entry individual para ser exibida num Card.
 */
export interface Entry {
  id: string;
  
  /** A chave identificadora do registro no XML (ex: "ApplianceMicrowave"). 
   * Para listas simples (GameTip), pode ser um índice ou gerado. */
  key: string; 
  
  /** A chave base do registro original (sem sufixos de campo). Ex: "ApplianceMicrowave". 
   * Útil para exibição na UI. */
  recordKey?: string;

  /** O texto original (inglês) extraído do XML. */
  original: string;
  
  /** A tradução atual em edição (estado 'edited'). */
  translation?: string;
  
  /** A tradução confirmada/salva (estado 'saved'). */
  savedTranslation?: string;
  
  status?: EntryStatus;

  /** A seção do XML onde este registro se encontra (ex: "Things", "Reagents", "HelpPage"). */
  section: string;
  
  /** O nome da tag do registro pai (ex: "Record", "RecordThing", "StationpediaPage"). */
  tagName?: string;

  /** O campo específico dentro do registro (ex: "Value", "Description", "Unit", "Title", "Text"). 
   * Null para tags que contêm o texto diretamente (como <String> em GameTips). */
  subkey: string | null;

  /** Seletor CSS-like único para localizar o nó exato no DOM XML original para atualização. */
  selector?: string;
}

export interface IMetadata {
  Language?: string;
  Code?: string;
  Font?: string;
}

// Definições de estruturas conhecidas do XML para referência e tipagem futura
// (Não usadas diretamente na UI, mas úteis para o parser entender o esquema)

export interface IXmlRecordBase {
  Key: string;
}

export interface IXmlRecord extends IXmlRecordBase {
  Value: string;
}

export interface IXmlRecordReagent extends IXmlRecord {
  Unit?: string;
}

export interface IXmlRecordThing extends IXmlRecord {
  Description?: string;
}

export interface IXmlStationpediaPage extends IXmlRecordBase {
  Title?: string;
  Text?: string;
  DisplayFilter?: string; // Geralmente não traduzível, mas parte da estrutura
}

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