import React, { useState } from "react";
import { parseStationeersXml, buildTranslatedStationeersXml } from "./lib/xmlParser";
import { readFileAsText, downloadFile } from "./lib/fileHelpers";
import type { Entry } from "./types";
import TranslationCard from "./components/TranslationCard";

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [xmlDoc, setXmlDoc] = useState<XMLDocument | null>(null);
  const [metadata, setMetadata] = useState<{ name?: string; code?: string; font?: string }>({});

  async function onXmlFile(file: File) {
    const txt = await readFileAsText(file);
    const { entries: parsedEntries, xmlDocument, metadata } = parseStationeersXml(txt);
    setEntries(parsedEntries);
    setXmlDoc(xmlDocument);
    setMetadata(metadata);
  }

  function updateTranslationByKey(key: string, value: string) {
    setEntries(prev => prev.map(e => e.key === key ? { ...e, translation: value } : e));
  }

  function exportProgressJson() {
    // Mapeia por key para re-hidratar facilmente
    const data = {
      metadata,
      translations: entries.reduce<Record<string, string | undefined>>((acc, e) => {
        acc[e.key] = e.translation;
        return acc;
      }, {}),
    };
    downloadFile("progress.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  }

  function importProgressJson(file: File) {
    readFileAsText(file).then(txt => {
      const obj = JSON.parse(txt);
      const translations = obj.translations ?? {};
      setEntries(prev => prev.map(e => ({ ...e, translation: translations[e.key] ?? e.translation })));
    });
  }

  function downloadTranslatedXml() {
    if (!xmlDoc) return alert("Nenhum XML carregado");
    const xml = buildTranslatedStationeersXml(xmlDoc, entries);
    downloadFile("translated.xml", xml, "text/xml;charset=utf-8");
  }

  return (
    <div>
      <h1>Stationeers Translation Helper</h1>
      <div>
        <input type="file" accept=".xml" onChange={e => e.target.files && onXmlFile(e.target.files[0])} />
        <input type="file" accept=".json" onChange={e => e.target.files && importProgressJson(e.target.files[0])} />
      </div>

      <div>
        <button onClick={exportProgressJson}>Exportar progresso (JSON)</button>
        <button onClick={downloadTranslatedXml}>Baixar XML traduzido</button>
      </div>

      <div>
        <h2>Entradas ({entries.length})</h2>
        {entries.map(e => (
          <TranslationCard key={e.id} entry={e} onChange={updateTranslationByKey} />
        ))}
      </div>
    </div>
  );
}
