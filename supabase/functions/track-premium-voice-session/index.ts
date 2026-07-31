import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { clampSessionMinutes, normalizeSessionId } from "../_shared/usageBounds.ts";

/**
 * Records a finished premium realtime-voice session into `usage_tracking`.
 *
 * Hardened 2026-07-30 (overhaul WS 1.1; wip-11a D8, plan 15 §R4):
 * - auth idiom unified on `requireUser` (was an inline auth.getUser);
 *   identity comes only from the verified JWT, never the request body;
 * - client-reported minutes are clamped to the premium-voice plausibility cap
 *   (`_shared/usageBounds.ts` — realtime voice is quota-limited to 15 min/month
 *   and auto-ends, so a flat unclamped number was pure client trust);
 * - a repeated `session_id` for the same student is deduplicated: the client
 *   has a three-tier reporting fallback (hook → this function → sendBeacon)
 *   that could previously double-record one session;
 * - `ended_at` is now stamped server-side so `cleanup-voice-sessions` does not
 *   later treat the recorded session as abandoned.
 *
 * Residual (Phase 2 ledger design): minutes remain client-reported, server-
 * bounded. True server measurement requires persisting the mint's
 * `session_start` (premium-voice-realtime issues one) as a session-open row
 * and computing duration from server clocks at close.
 */

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const gate = await requireUser(req, corsHeaders);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json();
    const sessionId = normalizeSessionId(body?.session_id);
    const minutes = clampSessionMinutes("premium_voice_practice", body?.minutes_used);

    if (!sessionId || minutes <= 0) {
      return json({ error: "Missing or invalid session_id / minutes_used" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Replay/double-report guard: one usage row per (student, session).
    const { data: existing, error: existingError } = await supabase
      .from("usage_tracking")
      .select("id")
      .eq("student_id", userId)
      .eq("session_id", sessionId)
      .limit(1);
    if (existingError) throw existingError;
    if (existing && existing.length > 0) {
      return json({ success: true, deduplicated: true });
    }

    const { error: insertError } = await supabase.from("usage_tracking").insert({
      student_id: userId,
      session_id: sessionId,
      session_type: "premium_voice_practice",
      minutes_used: minutes,
      ended_at: new Date().toISOString(),
    });
    if (insertError) throw insertError;

    return json({ success: true });
  } catch (error) {
    console.error("track-premium-voice-session error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
