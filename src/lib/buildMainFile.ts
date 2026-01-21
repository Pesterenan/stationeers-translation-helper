import { type Entry } from "../types";
import { createRecordElement } from "./xmlHelpers";

/**
 * Gera o arquivo 'english.xml' (principal).
 * - metadata: { Language, Code, Font }
 * - sections: map wrapperTag -> entries[]
 * - order: array of wrapper tags in the precise order to include
 */
export function buildMainLanguageXml(
  metadata: { Language?: string; Code?: string; Font?: string; [k: string]: string | undefined },
  sections: Record<string, Entry[]>,               // keys são nomes de wrapper tag (ex: "Reagents")
  order: string[] = [
    "Reagents","Gases","Actions","Things","Slots","Interactables",
    "Interface","Colors","Keys","Mineables","ScreenSpaceToolTips",
    "HelpPage","ThingPageOverride","HomePageButtonsOverride","GameStrings","GameTip"
  ]
): string {
  // criar documento e root com namespaces
  const doc = document.implementation.createDocument("", "", null);
  const langEl = doc.createElement("Language");
  langEl.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
  langEl.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");

  // metadados
  if (metadata.Language) {
    const nameEl = doc.createElement("Name");
    nameEl.appendChild(doc.createTextNode(metadata.Language));
    langEl.appendChild(nameEl);
  }
  if (metadata.Code) {
    const codeEl = doc.createElement("Code");
    codeEl.appendChild(doc.createTextNode(metadata.Code));
    langEl.appendChild(codeEl);
  }
  if (metadata.Font) {
    const fontEl = doc.createElement("Font");
    fontEl.appendChild(doc.createTextNode(metadata.Font));
    langEl.appendChild(fontEl);
  }

  // adicionar seções na ordem desejada. Mesmo que a seção não tenha entries,
  // criamos o elemento (self-closing se não tiver filhos).
  for (const wrapperTag of order) {
    const items = sections[wrapperTag] ?? [];

    const sectionEl = doc.createElement(wrapperTag);
    if (items.length > 0) {
      for (const e of items) {
        const rec = createRecordElement(doc, e.key, e.savedTranslation ?? e.translation ?? e.original);
        sectionEl.appendChild(rec);
      }
    }
    // append (mesmo vazio)
    langEl.appendChild(sectionEl);
  }

  doc.appendChild(langEl);
  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(doc);
}
