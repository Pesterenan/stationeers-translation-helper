import type { Entry } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Parseia um XML no formato Stationeers (Language -> ... -> Record -> Key/Value)
 * Retorna { entries, xmlDocument, metadata }.
 */
export function parseStationeersXml(xmlString: string): {
  entries: Entry[];
  xmlDocument: XMLDocument;
  metadata: { name?: string; code?: string; font?: string };
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const parsererror = doc.querySelector("parsererror");
  if (parsererror) throw new Error("XML parse error: " + parsererror.textContent);

  const entries: Entry[] = [];

  /** Metadata from XML file */
  const metadata: { name?: string; code?: string; font?: string } = {
    name: doc.querySelector("Language > Name")?.textContent ?? undefined,
    code: doc.querySelector("Language > Code")?.textContent ?? undefined,
    font: doc.querySelector("Language > Font")?.textContent ?? undefined,
  };

  const recordNodes = Array.from(doc.getElementsByTagName("Record"));
  for (const rec of recordNodes) {
    const keyNode = rec.querySelector("Key");
    const valueNode = rec.querySelector("Value");
    if (!keyNode) continue;
    const key = keyNode.textContent?.trim() ?? "";
    const original = valueNode?.textContent ?? "";
    if (key === "") continue;
    entries.push({
      id: uuidv4(),
      key,
      original,
      translation: undefined,
    });
  }

  return { entries, xmlDocument: doc, metadata };
}

/**
 * Aplica traduções por Key ao XMLDocument e retorna string XML.
 * A função não tenta alterar nós que não tenham correspondência de Key.
 */
export function buildTranslatedStationeersXml(doc: XMLDocument, entries: Entry[]): string {
  const docCopy = doc.cloneNode(true) as XMLDocument;

  // criar um mapa key -> translation (somente quando tradução presente)
  const map = new Map<string, string>();
  for (const e of entries) {
    if (e.translation != null && e.translation !== "") {
      map.set(e.key, e.translation);
    }
  }

  const recordNodes = Array.from(docCopy.getElementsByTagName("Record"));
  for (const rec of recordNodes) {
    const keyNode = rec.querySelector("Key");
    const valueNode = rec.querySelector("Value");
    if (!keyNode || !valueNode) continue;
    const key = keyNode.textContent?.trim() ?? "";
    if (map.has(key)) {
      // substitui o conteúdo textual do <Value>
      const newText = map.get(key) ?? "";
      // remove filhos antigos e cria um TextNode
      while (valueNode.firstChild) valueNode.removeChild(valueNode.firstChild);
      valueNode.appendChild(docCopy.createTextNode(newText));
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(docCopy);
}
