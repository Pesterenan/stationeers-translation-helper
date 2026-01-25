import { type Entry } from "../types";
import { DEFAULT_WRAPPERS_MAIN } from "./fileLayout";
import { buildXmlDocument } from "./xmlHelpers";

export function buildTipsXml(
  metadata: { Code?: string },
  entries: Entry[]
): string {
  const doc = buildXmlDocument(metadata);
  const langEl = doc.querySelector('Language')!;

  const wrapper = doc.createElement(DEFAULT_WRAPPERS_MAIN.gameTip);

  for (const e of entries) {
    const value = e.savedTranslation ?? e.translation ?? e.original ?? "";
    const strEl = doc.createElement("String");
    strEl.appendChild(doc.createTextNode(value));
    wrapper.appendChild(strEl);
  }

  langEl.appendChild(wrapper);

  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    serializer.serializeToString(doc)
  );
}
