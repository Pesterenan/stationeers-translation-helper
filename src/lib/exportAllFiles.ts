import JSZip from "jszip";
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
  const lang = (metadata.Language ?? "language").toLowerCase();
  const code = metadata.Code ?? "";

  const zip = new JSZip();

  // 1) main (english.xml)
  // O main contém Reagents, Things, etc.
  const mainXml = buildMainLanguageXml(metadata, categoriesMap);
  zip.file(`${lang}.xml`, mainXml);

  // 2) help (english_help.xml)
  // Parser gera section="HelpPage"
  const helpEntries = categoriesMap["HelpPage"] ?? categoriesMap["helpPage"] ?? [];
  if (helpEntries.length > 0) {
    const helpXml = buildHelpXml(metadata, helpEntries);
    zip.file(`${lang}_help.xml`, helpXml);
  }

  // 3) keys (english_keys.xml)
  // Parser gera section="Keys"
  const keysEntries = categoriesMap["Keys"] ?? categoriesMap["keys"] ?? [];
  if (keysEntries.length > 0) {
    const keysXml = buildKeysXml(metadata, keysEntries);
    zip.file(`${lang}_keys.xml`, keysXml);
  }

  // 4) tips (english_tips.xml)
  // Parser gera section="GameTip"
  const tipsEntries = categoriesMap["GameTip"] ?? categoriesMap["tips"] ?? [];
  if (tipsEntries.length > 0) {
    const tipsXml = buildTipsXml(metadata, tipsEntries);
    zip.file(`${lang}_tips.xml`, tipsXml);
  }

  // 5) tooltips (english_tooltips.xml)
  // Parser gera section="ScreenSpaceToolTips"
  const tooltipEntries = categoriesMap["ScreenSpaceToolTips"] ?? categoriesMap["tooltips"] ?? [];
  if (tooltipEntries.length > 0) {
    const tooltipsXml = buildTooltipsXml(metadata, tooltipEntries);
    zip.file(`${lang}_tooltips.xml`, tooltipsXml);
  }

  const content = await zip.generateAsync({ type: "blob" });
  
  // Trigger download no browser
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = options?.zipName ?? `${lang}_${code || "all"}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}