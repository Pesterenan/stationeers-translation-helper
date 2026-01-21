import { type Entry } from "../types";

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
