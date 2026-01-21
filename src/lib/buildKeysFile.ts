import { type Entry } from "../types";

export function buildKeysXml(
  metadata: { Code?: string },
  entries: Entry[]
) {
  const doc = document.implementation.createDocument("", "", null);
  const langEl = doc.createElement("Language");
  langEl.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  langEl.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");

  if (metadata.Code) {
    const codeEl = doc.createElement("Code");
    codeEl.appendChild(doc.createTextNode(metadata.Code));
    langEl.appendChild(codeEl);
  }

  const keysEl = doc.createElement("Keys");
  for (const e of entries) {
    const rec = doc.createElement("Record");
    const keyEl = doc.createElement("Key");
    keyEl.appendChild(doc.createTextNode(e.key));
    const valueEl = doc.createElement("Value");
    valueEl.appendChild(doc.createTextNode(e.savedTranslation ?? e.translation ?? e.original ?? ""));
    rec.appendChild(keyEl);
    rec.appendChild(valueEl);
    keysEl.appendChild(rec);
  }

  langEl.appendChild(keysEl);
  doc.appendChild(langEl);

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(doc);
}
