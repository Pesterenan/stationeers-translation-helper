import { type Entry, type IMetadata } from "../types";
import { buildXmlDocument, createRecordElement } from "./xmlHelpers";

/**
 * Gera o arquivo 'english.xml' (principal).
 * - metadata: { Language, Code, Font }
 * - sections: map wrapperTag -> entries[]
 * - order: array of wrapper tags in the precise order to include
 */
export function buildMainLanguageXml(
  metadata: IMetadata,
  sections: Record<string, Entry[]>,               // keys são nomes de wrapper tag (ex: "Reagents")
  order: string[] = [
    "Reagents","Gases","Actions","Things","Slots","Interactables",
    "Interface","Colors","Keys","Mineables","ScreenSpaceToolTips",
    "HelpPage","ThingPageOverride","HomePageButtonsOverride","GameStrings","GameTip"
  ]
): string {
  const doc = buildXmlDocument(metadata);
  const langEl = doc.querySelector("Language")!;

  // adicionar seções na ordem desejada. Mesmo que a seção não tenha entries,
  // criamos o elemento (self-closing se não tiver filhos).
  for (const wrapperTag of order) {
    const items = sections[wrapperTag] ?? [];

    const wrapper = doc.createElement(wrapperTag);
    if (items.length > 0) {
      for (const e of items) {
        const value = e.savedTranslation ?? e.translation ?? e.original ?? "";
        const record = createRecordElement(doc, e.key, value)
        wrapper.appendChild(record);
      }
    }
    // append (mesmo vazio)
    langEl.appendChild(wrapper);
  }

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(doc);
}
