import { SMS_TEMPLATES, type SupportedLanguageCode } from "@/lib/constants/languages";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const USE_REAL_SMS = Boolean(
  TWILIO_ACCOUNT_SID &&
    TWILIO_ACCOUNT_SID !== "AC..." &&
    TWILIO_AUTH_TOKEN &&
    TWILIO_AUTH_TOKEN !== "your-twilio-auth-token"
);

const TRACKING_BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------
function renderSmsBody(
  complaintNumber: string,
  language: string
): string {
  const langCode = (language in SMS_TEMPLATES ? language : "en") as SupportedLanguageCode;
  const template = SMS_TEMPLATES[langCode];
  const trackingUrl = `${TRACKING_BASE_URL}/track/${complaintNumber}`;

  return template
    .replace("{number}", complaintNumber)
    .replace("{url}", trackingUrl);
}

// ---------------------------------------------------------------------------
// Real mode — Twilio SMS
// ---------------------------------------------------------------------------
async function sendWithTwilio(
  phone: string,
  body: string
): Promise<{ providerMsgId: string; latencyMs: number }> {
  const startTime = Date.now();

  // Dynamic import to avoid bundling Twilio on the client
  const twilio = await import("twilio");
  const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const message = await client.messages.create({
    body,
    from: TWILIO_PHONE_NUMBER,
    to: phone,
  });

  const latencyMs = Date.now() - startTime;
  console.log(`[SMS] Twilio sent to ${phone} — SID: ${message.sid} — ${latencyMs}ms`);

  return { providerMsgId: message.sid, latencyMs };
}

// ---------------------------------------------------------------------------
// Mock mode — simulated send
// ---------------------------------------------------------------------------
async function sendWithMock(
  phone: string,
  body: string
): Promise<{ providerMsgId: string; latencyMs: number }> {
  // Simulate network latency (2-5 seconds)
  const simulatedDelay = 2000 + Math.floor(Math.random() * 3000);
  await new Promise((resolve) => setTimeout(resolve, Math.min(simulatedDelay, 500))); // Actual delay capped at 500ms for dev UX

  const mockSid = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log("=".repeat(60));
  console.log("[SMS] MOCK SMS SENT");
  console.log(`[SMS]   To:   ${phone}`);
  console.log(`[SMS]   Body: ${body}`);
  console.log(`[SMS]   SID:  ${mockSid}`);
  console.log("=".repeat(60));

  return { providerMsgId: mockSid, latencyMs: simulatedDelay };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SmsSendResult {
  success: boolean;
  latencyMs: number;
  provider: string;
  providerMsgId?: string;
  messageBody: string;
  error?: string;
}

/**
 * Send an acknowledgement SMS to the tourist confirming complaint registration.
 */
export async function sendAcknowledgementSms(
  phone: string,
  complaintNumber: string,
  language: string
): Promise<SmsSendResult> {
  const body = renderSmsBody(complaintNumber, language);

  if (USE_REAL_SMS) {
    try {
      console.log(`[SMS] Sending via Twilio to ${phone}`);
      const { providerMsgId, latencyMs } = await sendWithTwilio(phone, body);
      return {
        success: true,
        latencyMs,
        provider: "twilio",
        providerMsgId,
        messageBody: body,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[SMS] Twilio send failed:", errMsg);
      return {
        success: false,
        latencyMs: 0,
        provider: "twilio",
        messageBody: body,
        error: errMsg,
      };
    }
  }

  // Mock mode
  console.log(`[SMS] Using mock SMS sender (no TWILIO_ACCOUNT_SID)`);
  try {
    const { providerMsgId, latencyMs } = await sendWithMock(phone, body);
    return {
      success: true,
      latencyMs,
      provider: "mock",
      providerMsgId,
      messageBody: body,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      latencyMs: 0,
      provider: "mock",
      messageBody: body,
      error: errMsg,
    };
  }
}

/**
 * Send a generic SMS (used for escalation notifications, etc.).
 */
export async function sendSms(
  phone: string,
  body: string
): Promise<SmsSendResult> {
  if (USE_REAL_SMS) {
    try {
      const { providerMsgId, latencyMs } = await sendWithTwilio(phone, body);
      return { success: true, latencyMs, provider: "twilio", providerMsgId, messageBody: body };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[SMS] Twilio send failed:", errMsg);
      return { success: false, latencyMs: 0, provider: "twilio", messageBody: body, error: errMsg };
    }
  }

  const { providerMsgId, latencyMs } = await sendWithMock(phone, body);
  return { success: true, latencyMs, provider: "mock", providerMsgId, messageBody: body };
}
