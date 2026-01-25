import { type Entry, type IMetadata } from "../types";
import { DEFAULT_WRAPPERS_MAIN } from "./fileLayout";
import { buildXmlDocument, createRecordElement } from "./xmlHelpers";

/** Inspecting the final XML files, there are 51 'Record' objects inside 'ScreenSpaceToolTips' in the file
 * but only 48 of those start with 'StatusIcon' so 3 records are in the wrong place, or with a wrong key
 * which are the following:
 *
 * <Key>HydrationCaution</Key>
 * <Key>HydrationCritical</Key>
 * <Key>DeconstructCanisterFull</Key>
 * */
export function buildTooltipsXml(
  metadata: IMetadata,
  entries: Entry[],
): string {
  const doc = buildXmlDocument(metadata);
  const langEl = doc.querySelector("Language")!;

  const wrapper = doc.createElement(DEFAULT_WRAPPERS_MAIN.screenSpaceToolTips);

  for (const e of entries) {
    const value = e.savedTranslation ?? e.translation ?? e.original ?? "";
    const record = createRecordElement(doc, e.key, value);
    wrapper.appendChild(record);
  }

  langEl.appendChild(wrapper);

  const serializer = new XMLSerializer();
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    serializer.serializeToString(doc)
  );
}
