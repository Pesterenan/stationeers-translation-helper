import type { Entry } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Parseia XML (string) e retorna lista de Entry.
 * Cada entry tem um `selector` que é um caminho baseado em tag + índice
 * para permitir localizar o mesmo nó ao re-serializar.
 */
export function parseXmlToEntries(xmlString: string): { entries: Entry[]; xmlDocument: XMLDocument } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const parsererror = doc.querySelector("parsererror");
  if (parsererror) throw new Error("XML parse error: " + parsererror.textContent);

  const entries: Entry[] = [];

  function getNodePath(el: Element): string {
    const parts: string[] = [];
    let node: Element | null = el;
    while (node && node.nodeType === 1) {
      const parent = node.parentElement;
      if (!parent) {
        parts.unshift(node.nodeName);
        break;
      }
      const sameTagSiblings = Array.from(parent.children).filter(c => c.nodeName === node!.nodeName);
      const idx = sameTagSiblings.indexOf(node) + 1; // 1-based
      parts.unshift(`${node.nodeName}:nth(${idx})`);
      node = parent;
    }
    return parts.join(" > ");
  }

  function traverse(el: Element) {
    const children = Array.from(el.children);
    if (children.length === 0) {
      const text = el.textContent?.trim() ?? "";
      if (text !== "") {
        entries.push({
          id: uuidv4(),
          selector: getNodePath(el),
          original: text,
          translation: undefined,
        });
      }
      return;
    }
    children.forEach(child => traverse(child));
  }

  traverse(doc.documentElement);
  return { entries, xmlDocument: doc };
}

/**
 * Encontra um nó por selector gerado por getNodePath. Retorna Element | null.
 */
function findNodeBySelector(doc: XMLDocument, selector: string): Element | null {
  const parts = selector.split(">").map(p => p.trim());
  let current: Element | null = doc.documentElement;
  if (!current) return null;
  // primeira parte pode ser doc root; se não corresponder, buscar root by name
  const rootName = parts[0].split(":")[0];
  if (current.nodeName !== rootName) {
    // try to find root with that name
    const candidates = Array.from(doc.getElementsByTagName(rootName));
    if (candidates.length === 0) return null;
    current = candidates[0];
  }

  for (let i = 1; i < parts.length; i++) {
    const token = parts[i];
    const [tagPart, nthPart] = token.split(":nth(");
    const tag = tagPart;
    let idx = 1;
    if (nthPart) {
      idx = parseInt(nthPart.replace(")", ""), 10);
    }
    const childrenSame = Array.from(current.children).filter(c => c.nodeName === tag);
    current = childrenSame[idx - 1] ?? null;
    if (!current) return null;
  }
  return current;
}

/**
 * Aplica um mapa de traduções (id -> translation) ao XMLDocument e retorna string XML.
 */
export function buildTranslatedXml(doc: XMLDocument, entries: Entry[]): string {
  const docCopy = doc.cloneNode(true) as XMLDocument;
  for (const e of entries) {
    if (!e.translation) continue;
    const node = findNodeBySelector(docCopy, e.selector);
    if (node) {
      // Substitui apenas o texto interno
      while (node.firstChild) node.removeChild(node.firstChild);
      node.appendChild(docCopy.createTextNode(e.translation));
    }
  }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(docCopy);
}
