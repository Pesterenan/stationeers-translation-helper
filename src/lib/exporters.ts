import type { Entry } from "../types";

/** Mapeamento default de categoria -> wrapper XML tag */
export const DEFAULT_CATEGORY_WRAPPERS: Record<string, string> = {
  tooltips: "ScreenSpaceToolTips",
  tips: "Tips",
  help: "Help",
  keys: "Keys",
  reagents: "Reagents",
  ui: "UI",
  other: "Other",
};

/** Gera XML string para uma categoria */
export function buildCategoryXml(
  metadata: { Language?: string; Code?: string; Font?: string; [k: string]: string | undefined },
  entries: Entry[],
  wrapperTag = "Items"
): string {
  const doc = document.implementation.createDocument("", "", null);
  const langEl = doc.createElement("Language");

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

  const wrapper = doc.createElement(wrapperTag);

  for (const e of entries) {
    const record = doc.createElement("Record");
    const keyEl = doc.createElement("Key");
    keyEl.appendChild(doc.createTextNode(e.key));
    const valueEl = doc.createElement("Value");
    // prefer savedTranslation, fallback para translation, fallback para original
    const text = e.savedTranslation ?? e.translation ?? e.original ?? "";
    valueEl.appendChild(doc.createTextNode(text));
    record.appendChild(keyEl);
    record.appendChild(valueEl);
    wrapper.appendChild(record);
  }

  langEl.appendChild(wrapper);
  doc.appendChild(langEl);

  const serializer = new XMLSerializer();
  // adicionar declaração XML no topo
  const xmlString = '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(doc);
  return xmlString;
}

export function downloadFile(filename: string, content: string, mime = "text/xml;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Exporta todas as categorias (nomeadas) como arquivos separados */
export function exportCategoriesAsFiles(
  categories: Record<string, Entry[]>,
  metadata: { Language?: string; Code?: string; Font?: string },
  wrappers: Record<string, string> = DEFAULT_CATEGORY_WRAPPERS,
  fileNameTemplate = (cat: string, code?: string) => `${cat}${code ? `_${code}` : ""}.xml`
) {
  for (const cat of Object.keys(categories)) {
    const wrapper = wrappers[cat] ?? "Items";
    const xml = buildCategoryXml(metadata, categories[cat], wrapper);
    const safeFileName = fileNameTemplate(cat, metadata.Code);
    downloadFile(safeFileName, xml, "text/xml;charset=utf-8");
  }
}
