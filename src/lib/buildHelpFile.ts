import { type Entry } from "../types";

export function buildHelpXml(metadata: { Code?: string }, entries: Entry[]) {
  const doc = document.implementation.createDocument("", "", null);
  const langEl = doc.createElement("Language");
  langEl.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  langEl.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");

  if (metadata.Code) {
    const codeEl = doc.createElement("Code");
    codeEl.appendChild(doc.createTextNode(metadata.Code));
    langEl.appendChild(codeEl);
  }

  const helpPage = doc.createElement("HelpPage");

  // adicionar páginas fixas necessárias
  function makeStationpediaPage(key: string, title = key, text = " ") {
    const sp = doc.createElement("StationpediaPage");
    const k = doc.createElement("Key"); k.appendChild(doc.createTextNode(key)); sp.appendChild(k);
    const t = doc.createElement("Title"); t.appendChild(doc.createTextNode(title)); sp.appendChild(t);
    const tx = doc.createElement("Text"); tx.appendChild(doc.createTextNode(text)); sp.appendChild(tx);
    return sp;
  }
  helpPage.appendChild(makeStationpediaPage("Home", "Home", " "));
  helpPage.appendChild(makeStationpediaPage("Search", "Search", " "));

  // agrupar entries por base (ex: Help_Foo_Title / Help_Foo_Text)
  const pages: Record<string, { title?: string; text?: string }> = {};
  const regex = /^(?:Help_|HelpPage_)?(.+?)_(Title|Text)$/i;

  for (const e of entries) {
    const m = e.key.match(regex);
    if (m) {
      const base = m[1];
      const suf = m[2].toLowerCase();
      pages[base] = pages[base] || {};
      if (suf === "title") pages[base].title = e.savedTranslation ?? e.translation ?? e.original ?? "";
      if (suf === "text") pages[base].text = e.savedTranslation ?? e.translation ?? e.original ?? "";
    } else {
      // fallback: if key doesn't match suffix pattern, make a page with Key=key and Text=value
      pages[e.key] = pages[e.key] || {};
      if (!pages[e.key].text) pages[e.key].text = e.savedTranslation ?? e.translation ?? e.original ?? "";
    }
  }

  // criar StationpediaPage para cada base
  for (const base of Object.keys(pages)) {
    const info = pages[base];
    const pageEl = doc.createElement("StationpediaPage");
    const k = doc.createElement("Key"); k.appendChild(doc.createTextNode(base)); pageEl.appendChild(k);
    const t = doc.createElement("Title"); t.appendChild(doc.createTextNode(info.title ?? base)); pageEl.appendChild(t);
    const tx = doc.createElement("Text"); tx.appendChild(doc.createTextNode(info.text ?? " ")); pageEl.appendChild(tx);
    helpPage.appendChild(pageEl);
  }

  langEl.appendChild(helpPage);
  doc.appendChild(langEl);
  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(doc);
}
