/**
 * Simple translation service using Google Translate's free API endpoint.
 * NOTE: This is for educational/helper purposes and may have rate limits.
 */

const LANGUAGE_MAP: Record<string, string> = {
  "portuguese": "pt-PT",
  "português": "pt-PT",
  "brazilian-portuguese": "pb",
  "português brasileiro": "pb",
  "spanish": "es",
  "español": "es",
  "german": "de",
  "deutsch": "de",
  "french": "fr",
  "français": "fr",
  "italian": "it",
  "italiano": "it",
  "russian": "ru",
  "pусский": "ru",
  "chinese": "zh-CN",
  "中文": "zh-CN",
  "japanese": "ja",
  "日本語": "ja",
  "korean": "ko",
  "한국어": "ko",
};

export function mapLanguageToCode(langName: string | undefined, langCode: string | undefined): string {
  // Try code first (e.g., "PT", "EN", "ES")
  if (langCode) {
    const code = langCode.toLowerCase().trim();
    if (code === "pt-br" || code === "pb") return "pt-br";
    return code;
  }

  if (!langName) return "en"; // Default fallback
  const normalized = langName.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || "en";
}

export async function translateText(text: string, targetLang: string = "pt"): Promise<string> {
  if (!text || !text.trim()) return "";

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Google Translate returns an array of segments in data[0]
    // Each segment is [translatedText, originalText, ...]
    if (data && data[0]) {
      return data[0].map((segment: unknown[]) => (segment[0] as string) || "").join("");
    }

    return "";
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
