import type { Entry } from "../types";
import { v4 as uuidv4 } from "uuid";

/** Parseia um .resx (string) e retorna entries[] + metadata */
export function parseResxToEntries(resxString: string): {
  entries: Entry[];
  metadata: { Language?: string; Code?: string; Font?: string; [k: string]: string | undefined };
  xmlDocument: XMLDocument;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(resxString, "application/xml");
  const parsererror = doc.querySelector("parsererror");
  if (parsererror) throw new Error("XML parse error: " + parsererror.textContent);

  const entries: Entry[] = [];
  const metadata: Record<string, string | undefined> = {};

  // coletar <data> nodes
  const dataNodes = Array.from(doc.getElementsByTagName("data"));
  for (const node of dataNodes) {
    const name = node.getAttribute("name") ?? "";
    const valueNode = node.querySelector("value");
    const commentNode = node.querySelector("comment");
    const value = valueNode?.textContent ?? "";
    const comment = commentNode?.textContent ?? "";
    // metadata keys
    if (name === "Language" || name === "Code" || name === "Font") {
      metadata[name] = value;
      continue;
    }
    // compor Entry (usamos name como key)
    entries.push({
      id: uuidv4(),
      key: name,
      original: value,
      translation: undefined,
      savedTranslation: undefined,
      status: "unchanged",
    });
  }

  return { entries, metadata, xmlDocument: doc };
}
