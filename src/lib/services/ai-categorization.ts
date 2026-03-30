import type {
  AICategorizationResult,
  ComplaintCategory,
  Severity,
} from "@/types/complaint";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_REAL_AI = Boolean(OPENAI_API_KEY && OPENAI_API_KEY !== "sk-...");

const SYSTEM_PROMPT = `You are a complaint classifier for the Goa Tourism Department taxi grievance system. Given the following tourist complaint, return a JSON object with:
- category (one of: overcharging, refusal_of_service, harassment, unsafe_driving, meter_tampering, route_deviation, luggage_issues, other)
- subcategory (a more specific label, e.g. "inflated airport fare", "verbal abuse")
- severity (one of: low, medium, high, critical)
- confidence (0-1)
- summary (one concise English sentence)
- extractedFareCharged (number in INR or null)
- extractedFareExpected (estimated fair fare in INR or null)
- extractedVehicleNumber (string or null)
- sentimentScore (-1 to 1 where -1 is very angry, 1 is calm)

Return ONLY valid JSON, no markdown fencing.`;

// ---------------------------------------------------------------------------
// Keyword maps for mock categorization
// ---------------------------------------------------------------------------
const KEYWORD_MAP: { keywords: string[]; category: ComplaintCategory }[] = [
  {
    keywords: ["overcharge", "charge", "fare", "₹", "rupees", "price", "expensive", "costly", "money", "paid", "double", "triple"],
    category: "overcharging",
  },
  {
    keywords: ["refuse", "denied", "won't", "wouldn't", "reject", "turn away", "no ride", "declined"],
    category: "refusal_of_service",
  },
  {
    keywords: ["threat", "aggressive", "scared", "intimidat", "harass", "yell", "shout", "abus", "rude", "misbehav"],
    category: "harassment",
  },
  {
    keywords: ["fast", "dangerous", "drunk", "reckless", "speeding", "accident", "crash", "unsafe", "rash"],
    category: "unsafe_driving",
  },
  {
    keywords: ["meter", "tamper", "rigged", "manipulat", "broken meter", "no meter"],
    category: "meter_tampering",
  },
  {
    keywords: ["route", "deviat", "longer", "wrong way", "unnecessary", "detour", "scenic route"],
    category: "route_deviation",
  },
  {
    keywords: ["luggage", "bag", "suitcase", "belongings", "lost", "damage", "stolen"],
    category: "luggage_issues",
  },
];

const SEVERITY_KEYWORDS: { keywords: string[]; severity: Severity }[] = [
  {
    keywords: ["threat", "attack", "assault", "police", "hospital", "injur", "weapon", "kill", "die"],
    severity: "critical",
  },
  {
    keywords: ["aggressive", "scared", "intimidat", "danger", "reckless", "drunk", "unsafe", "accident"],
    severity: "high",
  },
  {
    keywords: ["rude", "overcharge", "refuse", "tamper", "deviat", "wrong"],
    severity: "medium",
  },
];

// ---------------------------------------------------------------------------
// Real mode — OpenAI GPT-4o-mini
// ---------------------------------------------------------------------------
async function categorizeWithOpenAI(
  text: string,
  language: string
): Promise<AICategorizationResult> {
  // Dynamic import to avoid bundling openai on the client
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const userMessage =
    language !== "en"
      ? `The following complaint was originally written in "${language}". Analyze it and return your JSON response:\n\n${text}`
      : `Analyze the following complaint and return your JSON response:\n\n${text}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(raw);

  // Validate and coerce the result
  const validCategories: ComplaintCategory[] = [
    "overcharging", "refusal_of_service", "harassment", "unsafe_driving",
    "meter_tampering", "route_deviation", "luggage_issues", "other",
  ];
  const validSeverities: Severity[] = ["low", "medium", "high", "critical"];

  const result: AICategorizationResult = {
    category: validCategories.includes(parsed.category) ? parsed.category : "other",
    subcategory: parsed.subcategory ?? null,
    severity: validSeverities.includes(parsed.severity) ? parsed.severity : "medium",
    confidence: typeof parsed.confidence === "number" ? Math.min(1, Math.max(0, parsed.confidence)) : 0.8,
    summary: typeof parsed.summary === "string" ? parsed.summary : "Complaint submitted for review.",
    extractedFareCharged: typeof parsed.extractedFareCharged === "number" ? parsed.extractedFareCharged : null,
    extractedFareExpected: typeof parsed.extractedFareExpected === "number" ? parsed.extractedFareExpected : null,
    extractedVehicleNumber: typeof parsed.extractedVehicleNumber === "string" ? parsed.extractedVehicleNumber : null,
    sentimentScore: typeof parsed.sentimentScore === "number" ? Math.min(1, Math.max(-1, parsed.sentimentScore)) : 0,
  };

  console.log("[AI-Categorization] OpenAI result:", JSON.stringify(result, null, 2));
  return result;
}

// ---------------------------------------------------------------------------
// Mock mode — keyword analysis
// ---------------------------------------------------------------------------
function categorizeWithMock(text: string): AICategorizationResult {
  const lower = text.toLowerCase();

  // --- Determine category ---
  let category: ComplaintCategory = "other";
  let maxMatches = 0;

  for (const entry of KEYWORD_MAP) {
    const matchCount = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      category = entry.category;
    }
  }

  // --- Determine subcategory ---
  const subcategoryMap: Record<ComplaintCategory, string> = {
    overcharging: "inflated fare",
    refusal_of_service: "service refusal",
    harassment: "verbal abuse",
    unsafe_driving: "reckless driving",
    meter_tampering: "meter manipulation",
    route_deviation: "unnecessary detour",
    luggage_issues: "baggage dispute",
    other: "general complaint",
  };
  const subcategory = subcategoryMap[category];

  // --- Determine severity ---
  let severity: Severity = "low";
  for (const entry of SEVERITY_KEYWORDS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      severity = entry.severity;
      break; // Take highest severity match (array is ordered critical → medium)
    }
  }

  // --- Extract fare amounts ---
  // Patterns: ₹1500, 1500 rupees, Rs 1500, Rs.1500, INR 1500
  const fareRegex = /(?:₹|rs\.?\s*|inr\s*)(\d[\d,]*)/gi;
  const fareMatches = Array.from(text.matchAll(fareRegex)).map((m) =>
    parseInt(m[1].replace(/,/g, ""), 10)
  );
  // Also match bare "NNNN rupees"
  const rupeeRegex = /(\d[\d,]*)\s*rupees/gi;
  const rupeeMatches = Array.from(text.matchAll(rupeeRegex)).map((m) =>
    parseInt(m[1].replace(/,/g, ""), 10)
  );
  const allFares = [...fareMatches, ...rupeeMatches].filter((n) => n > 0);

  let extractedFareCharged: number | null = null;
  let extractedFareExpected: number | null = null;
  if (allFares.length >= 2) {
    // Assume largest is charged, smallest is expected
    extractedFareCharged = Math.max(...allFares);
    extractedFareExpected = Math.min(...allFares);
  } else if (allFares.length === 1) {
    extractedFareCharged = allFares[0];
  }

  // --- Extract vehicle number ---
  // Goa pattern: GA-XX-X-XXXX or GA XX X XXXX
  const vehicleRegex = /GA[-\s]?\d{2}[-\s]?[A-Z][-\s]?\d{4}/gi;
  const vehicleMatch = text.match(vehicleRegex);
  const extractedVehicleNumber = vehicleMatch
    ? vehicleMatch[0].replace(/\s/g, "-").toUpperCase()
    : null;

  // --- Sentiment score ---
  const negativeWords = ["angry", "furious", "horrible", "terrible", "worst", "disgusting", "cheat", "fraud", "liar", "scared", "afraid"];
  const positiveWords = ["thank", "appreciate", "good", "helpful", "kind", "nice", "polite"];
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const sentimentScore = Math.max(-1, Math.min(1, (posCount - negCount) * 0.3));

  // --- Confidence ---
  const confidence = maxMatches > 0
    ? Math.min(0.95, 0.75 + maxMatches * 0.05)
    : 0.6;

  // --- Summary ---
  const summaryPrefix = {
    overcharging: "Tourist reports being overcharged for a taxi ride",
    refusal_of_service: "Tourist reports a taxi driver refusing service",
    harassment: "Tourist reports harassment or threatening behavior by a taxi driver",
    unsafe_driving: "Tourist reports dangerous or reckless driving",
    meter_tampering: "Tourist reports a tampered or rigged taxi meter",
    route_deviation: "Tourist reports the driver taking an unnecessarily long route",
    luggage_issues: "Tourist reports an issue with luggage during a taxi ride",
    other: "Tourist filed a general complaint regarding taxi service",
  };
  const summary = extractedFareCharged
    ? `${summaryPrefix[category]} (fare: INR ${extractedFareCharged}).`
    : `${summaryPrefix[category]}.`;

  const result: AICategorizationResult = {
    category,
    subcategory,
    severity,
    confidence,
    summary,
    extractedFareCharged,
    extractedFareExpected,
    extractedVehicleNumber,
    sentimentScore,
  };

  console.log("[AI-Categorization] Mock result:", JSON.stringify(result, null, 2));
  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function categorizeComplaint(
  text: string,
  language: string
): Promise<AICategorizationResult> {
  if (USE_REAL_AI) {
    try {
      console.log("[AI-Categorization] Using OpenAI GPT-4o-mini");
      return await categorizeWithOpenAI(text, language);
    } catch (error) {
      console.error("[AI-Categorization] OpenAI failed, falling back to mock:", error);
      return categorizeWithMock(text);
    }
  }

  console.log("[AI-Categorization] Using mock keyword analysis (no OPENAI_API_KEY)");
  return categorizeWithMock(text);
}
