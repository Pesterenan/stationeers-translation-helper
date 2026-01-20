import React, { useState } from "react";
import { parseXmlToEntries, buildTranslatedXml } from "./lib/xmlParser";
import { readFileAsText, downloadFile } from "./lib/fileHelpers";
import type { Entry } from "./types";

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = useState<XMLDocument | null>(null);
  const [filename, setFilename] = useState<string>("translation.xml");

  async function onXmlFile(file: File) {
    const txt = await readFileAsText(file);
    const { entries: parsedEntries, xmlDocument } = parseXmlToEntries(txt);
    setEntries(parsedEntries);
    setXmlDoc(xmlDocument);
    setFilename(file.name.replace(/\.xml$/i, "") + ".translated.xml");
  }

  function updateTranslation(id: string, value: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, translation: value } : e));
  }

  function exportTranslationsJSON() {
    const data = {
      filename,
      entries: entries.map(({ id, selector, original, translation }) => ({ id, selector, original, translation })),
    };
    downloadFile("translations.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  }

  function importTranslationsJSON(file: File) {
    readFileAsText(file).then(txt => {
      const obj = JSON.parse(txt);
      if (obj.entries) {
        // match by id when possible
        setEntries(prev => prev.map(e => {
          const match = obj.entries.find((x: any) => x.id === e.id || x.selector === e.selector);
          return match ? { ...e, translation: match.translation } : e;
        }));
      }
    });
  }

  function downloadTranslatedXml() {
    if (!xmlDoc) return alert("Nenhum XML carregado");
    const xml = buildTranslatedXml(xmlDoc, entries);
    downloadFile(filename, xml, "text/xml;charset=utf-8");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Stationeers Translation Helper</h1>

      <section>
        <label>
          Carregar XML:
          <input type="file" accept=".xml" onChange={e => e.target.files && onXmlFile(e.target.files[0])} />
        </label>
        <label style={{ marginLeft: 10 }}>
          Importar progresso (JSON):
          <input type="file" accept=".json" onChange={e => e.target.files && importTranslationsJSON(e.target.files[0])} />
        </label>
      </section>

      <section style={{ marginTop: 20 }}>
        <button onClick={exportTranslationsJSON}>Exportar progresso (JSON)</button>
        <button onClick={downloadTranslatedXml} style={{ marginLeft: 10 }}>Baixar XML traduzido</button>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Entradas ({entries.length})</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {entries.map(e => (
            <div key={e.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: "#666" }}>{e.selector}</div>
              <div style={{ marginTop: 6 }}>{e.original}</div>
              <textarea
                value={e.translation ?? ""}
                placeholder="Digite a tradução aqui..."
                onChange={ev => updateTranslation(e.id, ev.target.value)}
                style={{ width: "100%", minHeight: 80, marginTop: 8 }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
