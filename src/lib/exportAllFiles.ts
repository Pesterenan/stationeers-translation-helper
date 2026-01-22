import JSZip from "jszip"; // opcional, se usar zip
import { buildMainLanguageXml } from "./buildMainFile";
import { buildHelpXml } from "./buildHelpFile";
import { buildKeysXml } from "./buildKeysFile";
import type { Entry } from "../types";
import { buildTipsXml } from "./buildTipsFile";
import { buildTooltipsXml } from "./buildTooltipsFile";

/**
 * categoriesMap: record wrapperTag/name -> Entry[]
 * os nomes usados aqui devem corresponder aos wrappers que você usou (Reagents, Keys, etc)
 */
export async function exportFinalFilesAsZip(
  metadata: { Language?: string; Code?: string; Font?: string },
  categoriesMap: Record<string, Entry[]>,
  options?: { zipName?: string }
) {
console.log('METADATA', metadata);
console.log('CATEGORIES', categoriesMap);
  const lang = (metadata.Language ?? "language").toLowerCase();
  const code = metadata.Code ?? "";

  const zip = new JSZip();

  // 1) main (english.xml)
  const mainXml = buildMainLanguageXml(metadata, categoriesMap);
  zip.file(`${lang}.xml`, mainXml);

  // 2) help
  const helpXml = buildHelpXml(metadata, categoriesMap.HelpPage ?? categoriesMap.helpPage ?? []);
  zip.file(`${lang}_help.xml`, helpXml);

  // 3) keys
  const keysXml = buildKeysXml(metadata, categoriesMap.Keys ?? categoriesMap.keys ?? []);
  zip.file(`${lang}_keys.xml`, keysXml);

  // 4) tips
  const tipsXml = buildTipsXml(metadata, categoriesMap.tips);
  zip.file(`${lang}_tips.xml`, tipsXml);

  // 5) tooltips
  const tooltipsXml = buildTooltipsXml(metadata, categoriesMap.tooltips);
  zip.file(`${lang}_tooltips.xml`, tooltipsXml);

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = options?.zipName ?? `${lang}_${code || "all"}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
