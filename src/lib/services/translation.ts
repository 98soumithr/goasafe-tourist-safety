// ---------------------------------------------------------------------------
// Translation Service — Google Cloud Translation API v2 + Mock Fallback
// ---------------------------------------------------------------------------

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const USE_REAL_TRANSLATE = Boolean(
  GOOGLE_TRANSLATE_API_KEY && GOOGLE_TRANSLATE_API_KEY !== "your-google-api-key"
);

const GOOGLE_TRANSLATE_BASE = "https://translation.googleapis.com/language/translate/v2";

// ---------------------------------------------------------------------------
// Real mode — Google Cloud Translation API v2
// ---------------------------------------------------------------------------
async function detectLanguageGoogle(text: string): Promise<string> {
  const url = `${GOOGLE_TRANSLATE_BASE}/detect?key=${GOOGLE_TRANSLATE_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Translate detect failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const detections = data?.data?.detections;
  if (!detections || detections.length === 0 || detections[0].length === 0) {
    throw new Error("No language detected");
  }

  const detected = detections[0][0].language as string;
  console.log(`[Translation] Google detected language: ${detected} (confidence: ${detections[0][0].confidence})`);
  return detected;
}

async function translateToEnglishGoogle(
  text: string,
  sourceLang: string
): Promise<string> {
  if (sourceLang === "en") return text;

  const url = `${GOOGLE_TRANSLATE_BASE}?key=${GOOGLE_TRANSLATE_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: "en",
      format: "text",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Translate failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const translated = data?.data?.translations?.[0]?.translatedText;
  if (!translated) {
    throw new Error("No translation returned");
  }

  console.log(`[Translation] Google translated from ${sourceLang} to en: "${translated.slice(0, 80)}..."`);
  return translated;
}

// ---------------------------------------------------------------------------
// Mock mode — heuristic language detection + passthrough
// ---------------------------------------------------------------------------

// Unicode ranges and common words for detection
const LANG_DETECTION_RULES: { test: (text: string) => boolean; lang: string }[] = [
  {
    // Cyrillic characters → Russian
    test: (t) => /[\u0400-\u04FF]/.test(t),
    lang: "ru",
  },
  {
    // Hebrew characters → Hebrew
    test: (t) => /[\u0590-\u05FF]/.test(t),
    lang: "he",
  },
  {
    // German common words
    test: (t) => {
      const lower = t.toLowerCase();
      const germanWords = ["der", "die", "das", "und", "ist", "nicht", "ich", "ein", "eine", "sie", "mit", "auf", "für", "haben", "werden"];
      const matches = germanWords.filter((w) => lower.includes(` ${w} `) || lower.startsWith(`${w} `));
      return matches.length >= 2;
    },
    lang: "de",
  },
  {
    // French common words
    test: (t) => {
      const lower = t.toLowerCase();
      const frenchWords = ["le", "la", "les", "je", "nous", "est", "sont", "une", "dans", "avec", "pour", "que", "pas", "mais", "très"];
      const matches = frenchWords.filter((w) => lower.includes(` ${w} `) || lower.startsWith(`${w} `));
      return matches.length >= 2;
    },
    lang: "fr",
  },
];

function detectLanguageMock(text: string): string {
  for (const rule of LANG_DETECTION_RULES) {
    if (rule.test(text)) {
      console.log(`[Translation] Mock detected language: ${rule.lang}`);
      return rule.lang;
    }
  }
  console.log("[Translation] Mock detected language: en (default)");
  return "en";
}

function translateToEnglishMock(text: string, sourceLang: string): string {
  if (sourceLang === "en") {
    return text;
  }
  const result = `[Translated from ${sourceLang}] ${text}`;
  console.log(`[Translation] Mock translation (${sourceLang} → en): "${result.slice(0, 80)}..."`);
  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect the language of the given text.
 * Returns an ISO 639-1 language code (e.g. "en", "ru", "de", "he", "fr").
 */
export async function detectLanguage(text: string): Promise<string> {
  if (USE_REAL_TRANSLATE) {
    try {
      console.log("[Translation] Using Google Cloud Translation API for detection");
      return await detectLanguageGoogle(text);
    } catch (error) {
      console.error("[Translation] Google detect failed, falling back to mock:", error);
      return detectLanguageMock(text);
    }
  }

  console.log("[Translation] Using mock language detection (no GOOGLE_TRANSLATE_API_KEY)");
  return detectLanguageMock(text);
}

/**
 * Translate text to English.
 * If the text is already in English, returns it as-is.
 */
export async function translateToEnglish(
  text: string,
  sourceLang: string
): Promise<string> {
  if (sourceLang === "en") {
    return text;
  }

  if (USE_REAL_TRANSLATE) {
    try {
      console.log(`[Translation] Using Google Cloud Translation API (${sourceLang} → en)`);
      return await translateToEnglishGoogle(text, sourceLang);
    } catch (error) {
      console.error("[Translation] Google translate failed, falling back to mock:", error);
      return translateToEnglishMock(text, sourceLang);
    }
  }

  console.log(`[Translation] Using mock translation (${sourceLang} → en)`);
  return translateToEnglishMock(text, sourceLang);
}
