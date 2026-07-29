import { supabase } from "@/integrations/supabase/client";

/**
 * Client helpers for data that MUST be written server-side.
 *
 * Scores, certification results, proficiency levels and usage/quota counters are
 * no longer writable from the browser (RLS denies student INSERT/UPDATE on those
 * tables). Everything goes through service-role edge functions that re-derive the
 * user from the JWT, so a student cannot fabricate a grade or raise their own quota.
 */

type Json = Record<string, unknown>;

async function invoke<T = any>(fn: string, body: Json): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) {
      console.error(`[${fn}] failed:`, error.message);
      return null;
    }
    return data as T;
  } catch (error) {
    console.error(`[${fn}] threw:`, error);
    return null;
  }
}

/* ---------------------------------------------------------------- scores --- */

export interface CertificationAttemptInput {
  certification_type: string;
  score?: number;
  level?: string;
  completed?: boolean;
}

export async function createCertificationAttempts(attempts: CertificationAttemptInput[]) {
  const data = await invoke<{ attempts: any[] }>("record-certification-attempt", {
    action: "create",
    attempts,
  });
  return data?.attempts ?? null;
}

/**
 * Grade a reading/placement quiz server-side. The browser never computes the
 * score: it submits the question text + chosen option index and the edge
 * function scores it against an answer key that only exists on the server.
 */
export interface GradedQuizResult {
  success: boolean;
  score: number;
  level: string;
  correct: number;
  graded: number;
  skipped: number;
  attempt_id: string | null;
}

export async function gradeQuiz(params: {
  quiz_type: "reading" | "placement";
  answers: Array<{ question: string; selected: number | null }>;
  persist?: boolean;
}) {
  return invoke<GradedQuizResult>("grade-quiz", params);
}

export async function completeCertificationAttempts(
  updates: Array<{ id: string; score: number; level: string }>,
) {
  return invoke("record-certification-attempt", { action: "complete", updates });
}

export async function saveCertificationTranscript(params: {
  attempt_id: string;
  user_transcripts: unknown;
  ai_responses: unknown;
}) {
  return invoke("record-certification-attempt", { action: "save_transcript", ...params });
}

export async function recordLanguageMetric(metric: {
  session_id?: string;
  pronunciation_accuracy?: number;
  grammar_accuracy?: number;
  conversation_complexity?: number;
  fluency_score?: number;
  vocabulary_diversity?: number;
}) {
  return invoke("record-certification-attempt", { action: "language_metric", ...metric });
}

/* ----------------------------------------------------------------- usage --- */

export async function recordSessionUsage(params: {
  session_type: string;
  session_id?: string | null;
  minutes_used?: number;
  messages_count?: number;
  ended?: boolean;
}) {
  return invoke("track-usage", { action: "session", ...params });
}

export async function recordApiCall(params: {
  api_type?: string;
  service?: string;
  endpoint?: string;
  tokens_used?: number;
}) {
  return invoke("track-usage", { action: "api_call", ...params });
}

export async function consumeTextMessageQuota() {
  return invoke<{ success: boolean; reason?: string }>("track-usage", { action: "text_message" });
}

export async function consumeCertificationAttemptQuota() {
  return invoke<{ success: boolean; reason?: string; used?: number; limit?: number }>("track-usage", {
    action: "certification_attempt",
  });
}

/* ------------------------------------------------------------- age gate --- */

export interface AgeGateStatus {
  needsVerification: boolean;
  isMinor: boolean;
  parentalConsentGranted: boolean;
  safetyMode: string;
  birthYear: number | null;
}

export async function fetchAgeGateStatus(): Promise<AgeGateStatus | null> {
  return invoke<AgeGateStatus>("verify-age", { action: "status" });
}

export async function submitAgeVerification(birthYear: number, parentalConsent: boolean) {
  const { data, error } = await supabase.functions.invoke("verify-age", {
    body: { birthYear, parentalConsent },
  });
  if (error) {
    // 403 => under 13 without verifiable parental consent
    return { allowed: false, isMinor: true, reason: "parental_consent_required" as const };
  }
  return data as { allowed: boolean; isMinor: boolean; safetyMode: string; reason?: string };
}
