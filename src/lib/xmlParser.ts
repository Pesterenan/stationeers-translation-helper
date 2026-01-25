// src/lib/xmlParser.ts
import { type Entry } from "../types";
import { v4 as uuidv4 } from "uuid";

/** Helpers para criar um selector (caminho simples baseado em tag + índice) */
function getElementPath(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node.nodeType === 1) {
    const parent = node.parentElement;
    if (!parent) {
      parts.unshift(node.nodeName);
      break;
    }
    const siblings = Array.from(parent.children).filter((c) => c.nodeName === node!.nodeName);
    const idx = siblings.indexOf(node) + 1; // 1-based
    parts.unshift(`${node.nodeName}:nth(${idx})`);
    node = parent;
  }
  return parts.join(" > ");
}

/** encontra nó por selector criado por getElementPath */
function findNodeBySelector(doc: XMLDocument, selector: string): Element | null {
  const parts = selector.split(">").map((p) => p.trim());
  let current: Element | null = doc.documentElement;
  if (!current) return null;
  // se root diferente, tentar encontrar root que combine
  const rootName = parts[0].split(":")[0];
  if (current.nodeName !== rootName) {
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

/** Parseia um Stationeers XML (english.xml ou subfile) */
export function parseStationeersXml(xmlString: string): {
  entries: Entry[];
  metadata: { Language?: string; Code?: string; Font?: string; [k: string]: string | undefined };
  xmlDocument: XMLDocument;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const parsererror = doc.querySelector("parsererror");
  if (parsererror) throw new Error("XML parse error: " + parsererror.textContent);

  const entries: Entry[] = [];
  const metadata: Record<string, string | undefined> = {
    Language: doc.querySelector("Language > Name")?.textContent ?? undefined,
    Code: doc.querySelector("Language > Code")?.textContent ?? undefined,
    Font: doc.querySelector("Language > Font")?.textContent ?? undefined,
  };

  const recordSections = [
    "ScreenSpaceToolTips",
    "Keys",
    "Reagents",
    "Gases",
    "Actions",
    "Things",
    "Slots",
    "Interactables",
    "Interface",
    "Colors",
    "Mineables",
    "GameStrings",
  ];

  for (const section of recordSections) {
    const secEl = doc.querySelector(`Language > ${section}`);
    if (!secEl) continue;

    // procurar filhos cujo nome comece com "Record" (Record, RecordThing, RecordReagent, etc.)
    const recordEls = Array.from(secEl.children).filter((ch) => /^Record/i.test(ch.nodeName));
    for (const rec of recordEls) {
      const keyN = rec.querySelector("Key");
      const baseKey = (keyN?.textContent ?? "").trim();
      if (!baseKey) continue;

      // para cada filho do record (Value, Description, Unit, etc.), exceto Key, criamos uma Entry separada
      for (const child of Array.from(rec.children)) {
        if (child.nodeName === "Key") continue;
        const childTag = child.nodeName; // ex: "Value", "Description", "Unit"
        const text = child.textContent ?? "";

        entries.push({
          id: uuidv4(),
          key: `${baseKey}_${childTag}`, // ex: ApplianceMicrowave_Description
          original: text,
          translation: undefined,
          savedTranslation: undefined,
          status: "unchanged",
          section,
          subkey: childTag,
          // generate selector pointing to this child node so updates touch the correct element
          selector: getElementPath(child as Element),
        });
      }
    }
  }

  // 2) GameTip -> list of <String>
  const gameTipEl = doc.querySelector("Language > GameTip") ?? doc.querySelector("GameTip") ?? doc.querySelector("Language > GameTips");
  if (gameTipEl) {
    const strings = Array.from(gameTipEl.getElementsByTagName("String"));
    strings.forEach((s, idx) => {
      entries.push({
        id: uuidv4(),
        key: `GameTip_${idx + 1}`,
        original: s.textContent ?? "",
        translation: undefined,
        savedTranslation: undefined,
        status: "unchanged",
        section: "GameTip",
        subkey: null,
        selector: getElementPath(s),
      });
    });
  }

  // 3) HelpPage -> StationpediaPage (Key, Title, Text)
  const helpPageEl = doc.querySelector("Language > HelpPage") ?? doc.querySelector("HelpPage");
  if (helpPageEl) {
    const pages = Array.from(helpPageEl.getElementsByTagName("StationpediaPage"));
    pages.forEach((pg) => {
      const keyN = pg.querySelector("Key");
      const titleN = pg.querySelector("Title");
      const textN = pg.querySelector("Text");
      const baseKey = keyN?.textContent ?? `Help_${uuidv4()}`;
      if (titleN) {
        entries.push({
          id: uuidv4(),
          key: `${baseKey}_Title`,
          original: titleN.textContent ?? "",
          translation: undefined,
          savedTranslation: undefined,
          status: "unchanged",
          section: "HelpPage",
          subkey: "Title",
          selector: getElementPath(titleN),
        });
      }
      if (textN) {
        entries.push({
          id: uuidv4(),
          key: `${baseKey}_Text`,
          original: textN.textContent ?? "",
          translation: undefined,
          savedTranslation: undefined,
          status: "unchanged",
          section: "HelpPage",
          subkey: "Text",
          selector: getElementPath(textN),
        });
      }
    });
  }

  return { entries, metadata, xmlDocument: doc };
}

/** Aplica traduções ao XMLDocument usando entry.selector */
export function buildTranslatedStationeersXml(doc: XMLDocument, entries: Entry[]): string {
  const docCopy = doc.cloneNode(true) as XMLDocument;

  for (const e of entries) {
    if (!e.selector) continue;
    const node = findNodeBySelector(docCopy, e.selector);
    if (!node) continue;
    // caso node seja <Record> (contém Key + Value) ou seja um <Value> ou <String> ou <Title>/<Text>
    if (node.nodeName === "Record") {
      continue;
    } else if (node.nodeName === "Value" || node.nodeName === "String" || node.nodeName === "Title" || node.nodeName === "Text") {
      const newText = e.savedTranslation ?? e.translation ?? e.original ?? "";
      while (node.firstChild) node.removeChild(node.firstChild);
      node.appendChild(docCopy.createTextNode(newText));
    } else {
      // se o selector aponta para outro elemento (ex: a String foi selecionada via parent), tente atualizar seu textContent
      const newText = e.savedTranslation ?? e.translation ?? e.original ?? "";
      node.textContent = newText;
    }
  }
  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(docCopy);
}

/** Atualiza Name/Code/Font no XMLDocument (e retorna novo xml string) */
export function updateMetadataInXml(doc: XMLDocument, metadata: { Language?: string; Code?: string; Font?: string }): string {
  const docCopy = doc.cloneNode(true) as XMLDocument;
  const root = docCopy.documentElement;

  function upsertText(tag: string, value?: string) {
    if (!value) return;
    let el = root.querySelector(tag);
    if (el) {
      while (el.firstChild) el.removeChild(el.firstChild);
      el.appendChild(docCopy.createTextNode(value));
    } else {
      el = docCopy.createElement(tag);
      el.appendChild(docCopy.createTextNode(value));
      // insert Name/Code/Font near top (after any existing header). We'll append to root start.
      root.insertBefore(el, root.firstChild);
    }
  }

  upsertText("Name", metadata.Language);
  upsertText("Code", metadata.Code);
  upsertText("Font", metadata.Font);

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(docCopy);
}
