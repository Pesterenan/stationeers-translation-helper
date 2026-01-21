import { type Entry } from "../types";

export function buildTipsXml(
  metadata: { Code?: string },
  entries: Entry[]
): string {
  const doc = document.implementation.createDocument("", "", null);

  const langEl = doc.createElement("Language");
  langEl.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  langEl.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");

  // Code obrigatório
  if (metadata.Code) {
    const codeEl = doc.createElement("Code");
    codeEl.appendChild(doc.createTextNode(metadata.Code));
    langEl.appendChild(codeEl);
  }

  const gameTipEl = doc.createElement("GameTip");

  for (const e of entries) {
    const strEl = doc.createElement("String");
    const text =
      e.savedTranslation ??
      e.translation ??
      e.original ??
      "";

    strEl.appendChild(doc.createTextNode(text));
    gameTipEl.appendChild(strEl);
  }

  langEl.appendChild(gameTipEl);
  doc.appendChild(langEl);

  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    serializer.serializeToString(doc)
  );
}
