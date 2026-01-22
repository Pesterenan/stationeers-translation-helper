import { type IMetadata } from "../types";
import { DEFAULT_HEADER_WRAPPERS } from "./fileLayout";

export function createRecordElement(
  doc: XMLDocument,
  key: string,
  text: string,
) {
  const record = doc.createElement("Record");
  const keyEl = doc.createElement("Key");
  keyEl.appendChild(doc.createTextNode(key));
  const valueEl = doc.createElement("Value");
  valueEl.appendChild(doc.createTextNode(text ?? ""));
  record.appendChild(keyEl);
  record.appendChild(valueEl);
  return record;
}


/** Creates the XML header with default attributes */
export const buildXmlDocument = (metadata: IMetadata): XMLDocument => {
  const doc = document.implementation.createDocument("", "", null);

  const langEl = doc.createElement(DEFAULT_HEADER_WRAPPERS.language);
  langEl.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  langEl.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");

  if (metadata.Language) {
    const nameEl = doc.createElement(DEFAULT_HEADER_WRAPPERS.name);
    nameEl.appendChild(doc.createTextNode(metadata.Language));
    langEl.appendChild(nameEl);
  }

  if (metadata.Code) {
    const codeEl = doc.createElement(DEFAULT_HEADER_WRAPPERS.code);
    codeEl.appendChild(doc.createTextNode(metadata.Code));
    langEl.appendChild(codeEl);
  }

  if (metadata.Font) {
    const fontEl = doc.createElement(DEFAULT_HEADER_WRAPPERS.font);
    fontEl.appendChild(doc.createTextNode(metadata.Font));
    langEl.appendChild(fontEl);
  }

  doc.appendChild(langEl);
  return doc;
};
