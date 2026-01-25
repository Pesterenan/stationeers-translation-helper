import { type Entry } from "../types";
import { v4 as uuidv4 } from "uuid";

// ============================================================================ 
// DOM / Selector Helpers
// ============================================================================ 

/** 
 * Gera um seletor único (caminho CSS-like) para um elemento no DOM.
 * Ex: Language > Things:nth(1) > RecordThing:nth(5) > Description
 */
function getElementPath(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node.nodeType === 1) {
    const parent = node.parentElement;
    if (!parent) {
      parts.unshift(node.nodeName);
      break;
    }
    // Encontra o índice base-1 entre irmãos com a mesma tag
    const siblings = Array.from(parent.children).filter((c) => c.nodeName === node!.nodeName);
    const idx = siblings.indexOf(node) + 1; 
    parts.unshift(`${node.nodeName}:nth(${idx})`);
    node = parent;
  }
  return parts.join(" > ");
}

/** 
 * Encontra um nó no XMLDocument usando o seletor gerado por getElementPath 
 */
function findNodeBySelector(doc: XMLDocument, selector: string): Element | null {
  const parts = selector.split(">").map((p) => p.trim());
  let current: Element | null = doc.documentElement;
  
  if (!current) return null;

  // Valida root (geralmente "Language")
  const rootName = parts[0].split(":")[0];
  if (current.nodeName !== rootName) {
    // Tenta achar o root correto se o documento tiver wrapper ou parsererror
    const candidates = Array.from(doc.getElementsByTagName(rootName));
    if (candidates.length === 0) return null;
    current = candidates[0];
  }

  for (let i = 1; i < parts.length; i++) {
    const token = parts[i];
    const [tagPart, nthPart] = token.split(":nth(");
    const tag = tagPart;
    let idx = 1;
    if (nthPart) idx = parseInt(nthPart.replace(")", ""), 10);

    const childrenSame = Array.from(current.children).filter((c) => c.nodeName === tag);
    current = childrenSame[idx - 1] ?? null;
    if (!current) return null;
  }
  return current;
}

// ============================================================================ 
// Parsing Logic
// ============================================================================ 

interface SectionConfig {
  sectionTag: string;       // A tag da seção (ex: "Things", "Reagents")
  recordTag: string;        // A tag do item filho (ex: "RecordThing", "RecordReagent")
  translatableFields: string[]; // Os campos que queremos traduzir (ex: ["Value", "Description"])
}

// Definição explicita da estrutura do Stationeers XML
const SECTIONS_CONFIG: SectionConfig[] = [
  { sectionTag: "Things", recordTag: "RecordThing", translatableFields: ["Value", "Description"] },
  { sectionTag: "Reagents", recordTag: "RecordReagent", translatableFields: ["Value", "Unit"] },
  { sectionTag: "Gases", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Actions", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Slots", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Interactables", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Interface", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Colors", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Keys", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "Mineables", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "ScreenSpaceToolTips", recordTag: "Record", translatableFields: ["Value"] },
  { sectionTag: "GameStrings", recordTag: "Record", translatableFields: ["Value"] },
  // Adicione outras seções padrão "Record" aqui se necessário
];

export function parseStationeersXml(xmlString: string): {
  entries: Entry[];
  metadata: Record<string, string | undefined>;
  xmlDocument: XMLDocument;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  
  // Verificação básica de erro
  const parsererror = doc.querySelector("parsererror");
  if (parsererror) throw new Error("XML parse error: " + parsererror.textContent);

  const entries: Entry[] = [];

  // 1. Extrair Metadados
  const metadata: Record<string, string | undefined> = {
    Language: doc.querySelector("Language > Name")?.textContent ?? undefined,
    Code: doc.querySelector("Language > Code")?.textContent ?? undefined,
    Font: doc.querySelector("Language > Font")?.textContent ?? undefined,
  };

  const root = doc.querySelector("Language");
  if (!root) {
    // Se não tem tag Language, pode ser um fragmento ou formato inválido
    console.warn("Tag <Language> não encontrada na raiz.");
  }

  // 2. Processar Seções Configuradas (Standard Records)
  if (root) {
    for (const config of SECTIONS_CONFIG) {
      const secEl = root.querySelector(`:scope > ${config.sectionTag}`);
      if (!secEl) continue;

      const records = Array.from(secEl.children).filter((ch) => ch.nodeName === config.recordTag);
      
      for (const rec of records) {
        const keyNode = rec.querySelector("Key");
        const baseKey = keyNode?.textContent?.trim(); // Ex: "ApplianceMicrowave"

        if (!baseKey) continue; // Registro sem Key é inválido ou ignorado

        for (const field of config.translatableFields) {
          const fieldNode = rec.querySelector(field);
          if (fieldNode) {
                        entries.push({
                          id: uuidv4(),
                          // Key composta para unicidade na UI (ex: ApplianceMicrowave_Description)
                          key: `${baseKey}_${field}`, 
                          recordKey: baseKey,
                          original: fieldNode.textContent ?? "",              translation: undefined,
              savedTranslation: undefined,
              status: "unchanged",
              section: config.sectionTag,
              tagName: config.recordTag,
              subkey: field,
              selector: getElementPath(fieldNode),
            });
          }
        }
      }
    }
  }

  // 3. Processar Casos Especiais

  // --- HelpPage / StationpediaPage ---
  // Estrutura: <HelpPage> <StationpediaPage> <Key>...</Key> <Title>...</Title> <Text>...</Text> </StationpediaPage> ...
  const helpPageEl = doc.querySelector("Language > HelpPage") ?? doc.querySelector("HelpPage");
  if (helpPageEl) {
    const pages = Array.from(helpPageEl.children).filter(el => el.nodeName === "StationpediaPage");
    for (const pg of pages) {
      const keyNode = pg.querySelector("Key");
      const baseKey = keyNode?.textContent?.trim() ?? `Help_${uuidv4()}`;

      // Title
      const titleNode = pg.querySelector("Title");
      if (titleNode) {
        entries.push({
          id: uuidv4(),
          key: `${baseKey}_Title`,
          recordKey: baseKey,
          original: titleNode.textContent ?? "",
          status: "unchanged",
          section: "HelpPage",
          tagName: "StationpediaPage",
          subkey: "Title",
          selector: getElementPath(titleNode),
        });
      }

      // Text
      const textNode = pg.querySelector("Text");
      if (textNode) {
        entries.push({
          id: uuidv4(),
          key: `${baseKey}_Text`,
          recordKey: baseKey,
          original: textNode.textContent ?? "",
          status: "unchanged",
          section: "HelpPage",
          tagName: "StationpediaPage",
          subkey: "Text",
          selector: getElementPath(textNode),
        });
      }
    }
  }

  // --- GameTip ---
  // Estrutura: <GameTip> <String>Texto...</String> ... </GameTip>
  // Não tem Key, apenas lista de Strings
  const gameTipEl = doc.querySelector("Language > GameTip") ?? doc.querySelector("GameTip") ?? doc.querySelector("Language > GameTips");
  if (gameTipEl) {
    const strings = Array.from(gameTipEl.children).filter(el => el.nodeName === "String");
    strings.forEach((strNode, idx) => {
      entries.push({
        id: uuidv4(),
        key: `GameTip_${idx + 1}`, // Chave sintética
        original: strNode.textContent ?? "",
        status: "unchanged",
        section: "GameTip",
        tagName: "String",
        subkey: null, // Subkey null pois o valor é o próprio nó
        selector: getElementPath(strNode),
      });
    });
  }

  return { entries, metadata, xmlDocument: doc };
}

// ============================================================================ 
// Reconstruction Logic (Build XML)
// ============================================================================ 

export function buildTranslatedStationeersXml(doc: XMLDocument, entries: Entry[]): string {
  const docCopy = doc.cloneNode(true) as XMLDocument;

  for (const e of entries) {
    if (!e.selector) continue;
    
    // Ignorar se não houve mudança (opcional, mas seguro verificar se temos tradução)
    const newText = e.savedTranslation ?? e.translation;
    if (newText === undefined) continue; // Mantém original se não mexeu

    const node = findNodeBySelector(docCopy, e.selector);
    if (!node) {
      console.warn(`Node not found for selector: ${e.selector}`);
      continue;
    }

    // Atualiza o conteúdo de texto
    // Se o nó tiver filhos (improvável para Value/String/Text, mas possível se tiver tags HTML escapadas ou CDATA?) 
    // Stationeers usa texto plano ou tags tipo {LINK}, então textContent costuma ser seguro.
    // Mas para garantir que não quebre estrutura de tags internas se existissem, removemos children.
    while (node.firstChild) node.removeChild(node.firstChild);
    node.appendChild(docCopy.createTextNode(newText));
  }

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(docCopy);
}

export function updateMetadataInXml(doc: XMLDocument, metadata: { Language?: string; Code?: string; Font?: string }): string {
  const docCopy = doc.cloneNode(true) as XMLDocument;
  const root = docCopy.querySelector("Language") ?? docCopy.documentElement;

  function upsertText(tag: string, value?: string) {
    if (!value) return;
    let el = root.querySelector(`:scope > ${tag}`);
    if (el) {
      el.textContent = value;
    } else {
      el = docCopy.createElement(tag);
      el.textContent = value;
      // Insere logo no início
      root.insertBefore(el, root.firstChild);
    }
  }

  upsertText("Name", metadata.Language);
  upsertText("Code", metadata.Code);
  upsertText("Font", metadata.Font);

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(docCopy);
}