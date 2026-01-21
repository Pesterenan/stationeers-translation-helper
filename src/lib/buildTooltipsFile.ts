import { type Entry } from "../types";

export function buildTooltipsXml(
  metadata: { Language?: string; Code?: string; Font?: string },
  entries: Entry[]
): string {
  const doc = document.implementation.createDocument("", "", null);

  const langEl = doc.createElement("Language");
  langEl.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  langEl.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");

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

  const wrapper = doc.createElement("ScreenSpaceToolTips");

  for (const e of entries) {
    const record = doc.createElement("Record");

    const keyEl = doc.createElement("Key");
    keyEl.appendChild(doc.createTextNode(e.key));

    const valueEl = doc.createElement("Value");
    valueEl.appendChild(
      doc.createTextNode(
        e.savedTranslation ??
        e.translation ??
        e.original ??
        ""
      )
    );

    record.appendChild(keyEl);
    record.appendChild(valueEl);
    wrapper.appendChild(record);
  }

  langEl.appendChild(wrapper);
  doc.appendChild(langEl);

  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    serializer.serializeToString(doc)
  );
}
