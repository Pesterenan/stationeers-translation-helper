import { type Entry, type IMetadata } from "../types";
import { DEFAULT_WRAPPERS_MAIN, ENTRY_WRAPPERS } from "./fileLayout";
import { buildXmlDocument } from "./xmlHelpers";

export function buildTooltipsXml(
  metadata: IMetadata,
  entries: Entry[]
): string {
  const doc = buildXmlDocument(metadata);
  const langEl = doc.querySelector('Language')!;
console.log(langEl, 'langEl');
  const wrapper = doc.createElement(DEFAULT_WRAPPERS_MAIN.screenSpaceToolTips);

  for (const e of entries) {
    const record = doc.createElement(ENTRY_WRAPPERS.record);

    const keyEl = doc.createElement(ENTRY_WRAPPERS.key);
    keyEl.appendChild(doc.createTextNode(e.key));

    const valueEl = doc.createElement(ENTRY_WRAPPERS.value);
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

  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    serializer.serializeToString(doc)
  );
}
