import type { Entry } from "../types";

/** Recebe entries e um mapa de regras (category => RegExp[]) e retorna um map category -> Entry[] */
export function categorizeEntries(
  entries: Entry[],
  rules: Record<string, RegExp[]>
): Record<string, Entry[]> {
  const categories: Record<string, Entry[]> = {};
  // garantir ordem das categorias conforme object insertion (ou use array)
  const categoryNames = Object.keys(rules);

  for (const c of categoryNames) categories[c] = [];

  for (const e of entries) {
    let matched = false;
    for (const c of categoryNames) {
      const regexes = rules[c];
      for (const r of regexes) {
        if (r.test(e.key)) {
          categories[c].push(e);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    // if (!matched) {
    //   // fallback: se houver category 'other'
    //   if (categories["other"]) categories["other"].push(e);
    //   else (categories["other"] = categories["other"] || []).push(e);
    // }
  }

  console.log('CATEGORIES', categories.tooltips);
  return categories;
}
