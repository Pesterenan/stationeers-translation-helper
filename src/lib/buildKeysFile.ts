import { type Entry, type IMetadata } from "../types";
import { DEFAULT_WRAPPERS_MAIN } from "./fileLayout";
import { buildXmlDocument, createRecordElement } from "./xmlHelpers";

/** Inspecting the final XML files, there are 321 'Record' objects inside 'Keys' in the file */
export function buildKeysXml(metadata: IMetadata, entries: Entry[]): string {
  const doc = buildXmlDocument(metadata);
  const langEl = doc.querySelector("Language")!;

  const wrapper = doc.createElement(DEFAULT_WRAPPERS_MAIN.keys);

  for (const e of entries) {
    const value = e.savedTranslation ?? e.translation ?? e.original ?? "";
    const record = createRecordElement(doc, e.key, value)
    wrapper.appendChild(record);
  }

  langEl.appendChild(wrapper);

  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    serializer.serializeToString(doc)
  );
}
