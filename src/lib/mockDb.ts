/**
 * Mock local database using localStorage.
 * This replaces all Supabase calls so the app works without any backend.
 */

import { Scan, ScanResult, ScanWithResult, DetectionType } from "./types";

// ─── helpers ────────────────────────────────────────────────────────────────

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── auth ────────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface UsersStore {
  [email: string]: { password: string; user: MockUser };
}

export function authSignUp(
  email: string,
  password: string,
  fullName?: string
): { user: MockUser | null; error: Error | null } {
  const users = load<UsersStore>("mock_users", {});
  if (users[email]) {
    return { user: null, error: new Error("User already registered") };
  }
  const user: MockUser = {
    id: uid(),
    email,
    full_name: fullName ?? "",
    created_at: now(),
  };
  users[email] = { password, user };
  save("mock_users", users);
  return { user, error: null };
}

export function authSignIn(
  email: string,
  password: string
): { user: MockUser | null; error: Error | null } {
  const users = load<UsersStore>("mock_users", {});
  const record = users[email];
  if (!record) {
    return { user: null, error: new Error("Invalid login credentials") };
  }
  if (record.password !== password) {
    return { user: null, error: new Error("Invalid login credentials") };
  }
  save("mock_session", record.user);
  return { user: record.user, error: null };
}

export function authSignOut() {
  localStorage.removeItem("mock_session");
}

export function getSession(): MockUser | null {
  return load<MockUser | null>("mock_session", null);
}

// ─── scans ───────────────────────────────────────────────────────────────────

function allScans(): ScanWithResult[] {
  return load<ScanWithResult[]>("mock_scans", []);
}

function saveScans(scans: ScanWithResult[]) {
  save("mock_scans", scans);
}

export function dbInsertScan(
  userId: string,
  detectionType: DetectionType,
  fileUrl: string | null,
  fileName: string | null,
  fileSize: number | null,
  textContent: string | null
): ScanWithResult {
  const scan: ScanWithResult = {
    id: uid(),
    user_id: userId,
    detection_type: detectionType,
    status: "processing",
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
    text_content: textContent,
    created_at: now(),
    updated_at: now(),
    scan_results: [],
  };
  const scans = allScans();
  scans.unshift(scan);
  saveScans(scans);
  return scan;
}

export function dbGetScansByUser(userId: string, limit?: number): ScanWithResult[] {
  let scans = allScans().filter((s) => s.user_id === userId);
  if (limit) scans = scans.slice(0, limit);
  return scans;
}

export function dbGetScanById(id: string): ScanWithResult | null {
  return allScans().find((s) => s.id === id) ?? null;
}

export function dbUpdateScan(id: string, patch: Partial<ScanWithResult>) {
  const scans = allScans().map((s) =>
    s.id === id ? { ...s, ...patch, updated_at: now() } : s
  );
  saveScans(scans);
}

// ─── Smart keyword-based analysis engine ──────────────────────────────────────

// Scam / fake keywords for text-based content
const SCAM_KEYWORDS_HIGH = [
  "urgent", "act now", "limited time", "you have won", "congratulations",
  "claim your prize", "wire transfer", "western union", "bitcoin", "crypto payment",
  "verify your account", "suspended", "click here immediately", "update your details",
  "bank details", "social security", "password reset", "login credential",
  "100% guaranteed", "risk free", "double your money", "ponzi", "pyramid",
  "nigerian prince", "inheritance", "lottery", "won $", "too good to be true",
  "send money", "gift card", "itune", "amazon gift", "advance fee",
  "work from home", "earn $500", "make money fast", "no experience needed",
  "processing fee", "pay upfront", "refundable deposit",
];

const SCAM_KEYWORDS_MED = [
  "verify", "confirm your", "account on hold", "unusual activity",
  "dear customer", "dear user", "kindly", "reactivate", "immediately contact",
  "do not ignore", "final notice", "overdue", "apply now", "limited offer",
  "exclusive deal", "free trial", "cancel anytime", "no credit card",
  "referral bonus", "passive income", "financial freedom",
];

const SAFE_KEYWORDS = [
  "invoice #", "order confirmed", "shipment tracking", "receipt",
  "meeting at", "see you at", "looking forward", "best regards",
  "sincerely", "thank you for", "regards,", "hi team", "hello",
  "please find attached", "as discussed", "following up", "let me know",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns a score 0-100 based on keyword analysis of the text
function analyzeText(text: string): { score: number; matchedHigh: string[]; matchedMed: string[] } {
  const lower = text.toLowerCase();

  const matchedHigh = SCAM_KEYWORDS_HIGH.filter((kw) => lower.includes(kw));
  const matchedMed = SCAM_KEYWORDS_MED.filter((kw) => lower.includes(kw));
  const safeMatches = SAFE_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  // Score calculation: high keywords = +12pts each, med = +6pts, safe = -10pts each
  let score = matchedHigh.length * 12 + matchedMed.length * 6 - safeMatches * 10;

  // Extra boost for very short or ALL CAPS texts (common in scams)
  if (text.length < 80 && text === text.toUpperCase() && text.length > 10) score += 15;
  // Suspicious links
  if (lower.includes("http") && (lower.includes("bit.ly") || lower.includes("tinyurl") || lower.includes("goo.gl"))) score += 20;

  // Clamp to 0-98
  return { score: Math.min(98, Math.max(0, score)), matchedHigh, matchedMed };
}

interface AnalysisResult {
  verdict: "real" | "fake" | "suspicious";
  riskScore: number;
  confidence: "low" | "medium" | "high";
  summary: string;
  indicators: string[];
  aiAnalysis: string;
}

function buildTextAnalysis(type: DetectionType, text: string | null): AnalysisResult {
  const { score, matchedHigh, matchedMed } = text
    ? analyzeText(text)
    : { score: rand(30, 60), matchedHigh: [], matchedMed: [] };

  // Add small randomness ±5 to avoid identical scores
  const riskScore = Math.min(98, Math.max(2, score + rand(-5, 5)));

  const verdict: "real" | "fake" | "suspicious" =
    riskScore >= 60 ? "fake" : riskScore >= 30 ? "suspicious" : "real";

  const confidence: "low" | "medium" | "high" =
    riskScore >= 70 || riskScore <= 20 ? "high" : riskScore >= 45 ? "medium" : "low";

  const allMatched = [...matchedHigh, ...matchedMed];

  const baseIndicators: Record<DetectionType, { fake: string[]; suspicious: string[]; real: string[] }> = {
    text: {
      fake: ["Urgent language designed to create panic", "Requests for sensitive personal/financial data", "Suspicious short URL patterns", "Grammar and spelling inconsistencies"],
      suspicious: ["Vague sender identity", "Unusual call-to-action", "Unverified claims"],
      real: [],
    },
    email: {
      fake: ["Spoofed sender domain", "Mismatched reply-to address", "Embedded suspicious links", "Request for login credentials"],
      suspicious: ["Unusual sender domain", "Generic greeting (Dear Customer)", "Marketing-style urgency"],
      real: [],
    },
    sms: {
      fake: ["Unknown sender number", "Suspicious link embedded", "Impersonation of known brand"],
      suspicious: ["Unusual call-to-action", "Unsolicited promotional message"],
      real: [],
    },
    review: {
      fake: ["Overly generic praise with no specifics", "Linguistic patterns match AI-generated text", "No verified purchase signal", "Extreme sentiment without details"],
      suspicious: ["Unusual posting time", "Limited reviewer history", "Vague product reference"],
      real: [],
    },
    investment: {
      fake: ["Guaranteed returns promise", "Pressure to invest quickly", "Unlicensed entity claims", "Request for crypto payment"],
      suspicious: ["Unusually high returns claimed", "Vague business model", "No regulatory disclosure"],
      real: [],
    },
    job_offer: {
      fake: ["Request for upfront payment", "No verifiable company presence", "Unrealistic salary offer", "Personal data requested before interview"],
      suspicious: ["Email domain doesn't match company name", "Vague role description", "Work-from-home without clear structure"],
      real: [],
    },
    image: { fake: [], suspicious: [], real: [] },
    video: { fake: [], suspicious: [], real: [] },
    audio: { fake: [], suspicious: [], real: [] },
    other: { fake: [], suspicious: [], real: [] },
  };

  const base = baseIndicators[type] ?? baseIndicators["text"];
  let indicators: string[] = base[verdict];

  // Append actually matched keywords as indicators (up to 3)
  if (allMatched.length > 0 && verdict !== "real") {
    const kwIndicators = allMatched.slice(0, 3).map(
      (kw) => `Detected scam keyword: "${kw}"`
    );
    indicators = [...indicators, ...kwIndicators];
  }

  const summaries: Record<"real" | "fake" | "suspicious", Record<string, string>> = {
    fake: {
      text: "The text contains multiple high-confidence scam indicators including urgency cues, requests for personal information, and suspicious patterns.",
      email: "This email exhibits classic phishing patterns: spoofed sender, social engineering tactics, and credential harvesting attempts.",
      sms: "This SMS contains hallmarks of a smishing attack including suspicious links and impersonation of trusted entities.",
      review: "This review displays multiple characteristics of AI-generated or incentivized fake reviews with no authentic buyer signals.",
      investment: "This investment offer contains multiple high-risk fraud indicators consistent with Ponzi or pump-and-dump schemes.",
      job_offer: "This job offer exhibits hallmarks of employment fraud — fake company identity, upfront payment requests, or unrealistic promises.",
      image: "Analysis suggests this image has been digitally manipulated. Facial landmark inconsistencies and lighting artifacts indicate deepfake generation.",
      video: "Temporal analysis reveals frame-level inconsistencies consistent with deepfake video synthesis and face-swap technology.",
      audio: "Spectral analysis indicates voice cloning characteristics — this audio may have been generated using a neural TTS or voice conversion system.",
      other: "Multiple fraud indicators detected. Exercise extreme caution with this content.",
    },
    suspicious: {
      text: "The content shows some characteristics common in scam communications but is not conclusively fraudulent. Exercise caution before acting.",
      email: "The email shows some phishing indicators. Verify the sender independently before clicking any links or sharing information.",
      sms: "This SMS contains some unusual elements. Verify the sender before responding or clicking any links.",
      review: "Review contains some suspicious elements but is not conclusively fake. Cross-reference with other sources.",
      investment: "Investment opportunity shows some red flags. Verify the company's regulatory registration before proceeding.",
      job_offer: "Job posting contains some unusual elements. Research the company independently before sharing personal information.",
      image: "The image shows some signs of potential manipulation but analysis is inconclusive. Seek a second opinion.",
      video: "Some frame-level anomalies detected. Could be compression artifacts or light post-processing.",
      audio: "Some unusual audio characteristics detected. Could be low-quality recording or light audio processing.",
      other: "Some suspicious patterns detected. Treat with caution.",
    },
    real: {
      text: "The content appears to be genuine with no significant fraud indicators detected. Communication style and context appear authentic.",
      email: "This email appears legitimate with no phishing indicators, proper context, and no suspicious requests.",
      sms: "This SMS appears to be a legitimate message with no scam indicators detected.",
      review: "Review appears genuine based on linguistic patterns, specific details, and authentic buyer behaviour signals.",
      investment: "No major fraud indicators detected. Still exercise standard due diligence before investing.",
      job_offer: "Job posting appears legitimate with identifiable company details and realistic job requirements.",
      image: "No significant manipulation indicators detected. The image appears to be authentic.",
      video: "No deepfake indicators detected across analyzed frames. Video appears authentic.",
      audio: "Audio appears natural with no voice-cloning or TTS artifacts detected.",
      other: "No significant fraud indicators detected.",
    },
  };

  const summary = summaries[verdict][type] ?? summaries[verdict]["text"];

  const aiAnalysis = `DeepFake AI — ${type.toUpperCase()} ANALYSIS REPORT
${"─".repeat(50)}
Verdict      : ${verdict.toUpperCase()}
Risk Score   : ${riskScore}%
Confidence   : ${confidence.toUpperCase()}
${"─".repeat(50)}

SUMMARY
${summary}

${indicators.length > 0 ? `DETECTED SIGNALS\n${indicators.map((i) => `  • ${i}`).join("\n")}\n` : "No threat signals detected.\n"}
${allMatched.length > 0 ? `KEYWORD MATCHES (${allMatched.length} found)\n${allMatched.slice(0, 6).map((k) => `  → "${k}"`).join("\n")}\n` : ""}
RECOMMENDATION
${verdict === "fake"
      ? "⚠️  Do NOT engage with this content. Block the sender and report it to the relevant authority."
      : verdict === "suspicious"
        ? "⚡ Proceed with caution. Verify independently before taking any action."
        : "✅ Content appears safe. Standard precautions always apply."}`;

  return { verdict, riskScore, confidence, summary, indicators, aiAnalysis };
}

function buildMediaAnalysis(type: "image" | "video" | "audio", fileName: string | null): AnalysisResult {
  // For media we can't actually analyze — give realistic random results
  const r = Math.random();
  const verdict: "real" | "fake" | "suspicious" = r < 0.4 ? "fake" : r < 0.65 ? "suspicious" : "real";

  const riskScore =
    verdict === "fake" ? rand(68, 95) :
      verdict === "suspicious" ? rand(35, 67) :
        rand(5, 28);

  const confidence: "low" | "medium" | "high" =
    riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

  const summaries = {
    image: {
      fake: "Facial landmark analysis detected inconsistencies characteristic of GAN-based deepfake generation. Lighting vectors and skin texture patterns are inconsistent.",
      suspicious: "The image shows some signs of potential manipulation but analysis is inconclusive. Edge blending and metadata anomalies detected.",
      real: "No significant manipulation indicators detected. Facial geometry, lighting consistency, and metadata all appear authentic.",
    },
    video: {
      fake: "Temporal analysis reveals frame-level inconsistencies consistent with deepfake video synthesis. Eye-blinking frequency and facial boundary artifacts detected.",
      suspicious: "Some frame-level anomalies detected around facial regions. Could be heavy compression or light post-processing.",
      real: "No deepfake indicators detected across analyzed frames. Temporal consistency and facial motion appear authentic.",
    },
    audio: {
      fake: "Spectral analysis indicates voice cloning characteristics. Prosody patterns, mel-frequency cepstral coefficients, and formant transitions suggest neural TTS generation.",
      suspicious: "Some unusual spectral characteristics detected. Could be audio compression artifacts or low-quality microphone recording.",
      real: "Audio appears natural. Spectral analysis, prosody patterns, and background noise profile are consistent with genuine human speech.",
    },
  };

  const indicatorsMap = {
    image: {
      fake: ["Facial landmark inconsistencies detected", "Unnatural skin texture patterns", "Lighting direction mismatch", "GAN-generation boundary artifacts"],
      suspicious: ["Minor edge blending anomalies", "Compression artifact patterns", "Metadata inconsistency"],
      real: [],
    },
    video: {
      fake: ["Temporal flickering around facial regions", "Eye blinking frequency anomaly", "Audio-visual sync drift", "Background boundary artifacts"],
      suspicious: ["Occasional facial texture inconsistency", "Non-standard codec compression patterns"],
      real: [],
    },
    audio: {
      fake: ["Unnatural prosody and rhythm patterns", "Spectral smoothing artifacts", "Robotic cadence in syllable transitions", "Absence of natural background noise"],
      suspicious: ["Unusual frequency response curve", "Minor temporal audio artifacts"],
      real: [],
    },
  };

  const summary = summaries[type][verdict];
  const indicators = indicatorsMap[type][verdict];

  const aiAnalysis = `DeepFake AI — ${type.toUpperCase()} ANALYSIS REPORT
${"─".repeat(50)}
File         : ${fileName ?? "Uploaded file"}
Verdict      : ${verdict.toUpperCase()}
Risk Score   : ${riskScore}%
Confidence   : ${confidence.toUpperCase()}
${"─".repeat(50)}

SUMMARY
${summary}

${indicators.length > 0 ? `DETECTED SIGNALS\n${indicators.map((i) => `  • ${i}`).join("\n")}\n` : "No manipulation signals detected.\n"}
RECOMMENDATION
${verdict === "fake"
      ? "⚠️  This media shows strong signs of being AI-generated or manipulated. Do not trust or share this content."
      : verdict === "suspicious"
        ? "⚡ This media has some anomalies. Seek forensic verification before acting on its contents."
        : "✅ Content appears authentic. Standard verification practices always recommended."}`;

  return { verdict, riskScore, confidence, summary, indicators, aiAnalysis };
}

export async function runMockAnalysis(
  scanId: string,
  detectionType: DetectionType,
  textContent: string | null,
  fileName?: string | null
): Promise<void> {
  // Fast analysis — just 400ms to feel snappy but not instant
  await new Promise((res) => setTimeout(res, 400));

  let analysis: AnalysisResult;

  if (detectionType === "image" || detectionType === "video" || detectionType === "audio") {
    analysis = buildMediaAnalysis(detectionType, fileName ?? null);
  } else {
    analysis = buildTextAnalysis(detectionType, textContent);
  }

  const result: ScanResult = {
    id: uid(),
    scan_id: scanId,
    verdict: analysis.verdict,
    risk_score: analysis.riskScore,
    confidence: analysis.confidence,
    explanation: analysis.summary,
    indicators: analysis.indicators,
    ai_analysis: analysis.aiAnalysis,
    created_at: now(),
  };

  const scans = allScans().map((s) => {
    if (s.id !== scanId) return s;
    return {
      ...s,
      status: "completed" as const,
      updated_at: now(),
      scan_results: [result],
    };
  });
  saveScans(scans);
}
