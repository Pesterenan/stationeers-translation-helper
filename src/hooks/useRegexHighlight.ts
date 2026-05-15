export type RegexMatch = { start: number; end: number; matchText: string };
const MAX_HIGHLIGHT_LENGTH = 1000;

/** Hook that finds all regex matches within a text and returns their coordinates (ranges). */
export function useRegexHighlight(
  text: string | null | undefined,
  regex: RegExp | null
): RegexMatch[] {
  if (!text || !regex || text.length > MAX_HIGHLIGHT_LENGTH) {
    return [];
  }

  const matches: RegexMatch[] = [];
  let matchCount = 0;
  const MAX_MATCHES_COUNT = 25; // Limit matches to prevent freezing

  try {
    // Use matchAll for reliable iteration over all global regex matches
    const allMatches = [...text.matchAll(regex)];

    for (const match of allMatches) {
      if (matchCount >= MAX_MATCHES_COUNT) break;

      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        matchText: match[0],
      });
      matchCount++;
    }
  } catch (e) {
    matchCount = 0;
    console.error("Error executing regex highlight:", e);
  }

  return matches;
}
