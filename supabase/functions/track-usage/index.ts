import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import {
  clampMessageCount,
  clampSessionMinutes,
  isVoiceSessionType,
  normalizeSessionId,
  normalizeSessionType,
} from "../_shared/usageBounds.ts";

/**
 * Server-side writer for usage/quota data.
 * `usage_tracking`, `api_calls_tracking` and `student_usage_limits` are no longer
 * client-writable — otherwise a student could raise their own monthly quota.
 *
 * Hardened 2026-07-30 (overhaul WS 1.1; wip-11a D8):
 * - identity always comes from the verified JWT (`requireUser`), never the body;
 * - client-reported durations are clamped to per-session-type plausibility caps
 *   (`_shared/usageBounds.ts`) instead of a flat 240-minute ceiling;
 * - a repeated `session_id` for the same student is deduplicated instead of
 *   double-billed (the premium-voice client has a multi-tier reporting fallback
 *   that could previously record the same session twice);
 * - only voice-type sessions consume the monthly voice-minute quota (previously
 *   text sessions also called `increment_voice_usage`).
 *
 * Residual (Phase 2 ledger design, wip-11a D8): duration is still client-
 * *reported*, only server-*bounded*. Full server measurement needs a
 * server-issued session-open row at start (e.g. the premium-voice mint's
 * `session_start`) and a server-stamped close so minutes derive from server
 * clocks; `usage_tracking` today only gains its row at session end, so there
 * is no earlier server timestamp to cross-check against.
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const action = String(body?.action ?? "");

    // Make sure a limits row exists for this student.
    await supabase.rpc("initialize_student_usage_limits", { target_student_id: userId });

    if (action === "session") {
      const sessionType = normalizeSessionType(body.session_type);
      const minutes = clampSessionMinutes(sessionType, body.minutes_used);
      const messages = clampMessageCount(body.messages_count);
      const sessionId = normalizeSessionId(body.session_id);

      // Replay/double-report guard: one usage row per (student, session).
      if (sessionId) {
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
      }

      const { error } = await supabase.from("usage_tracking").insert({
        student_id: userId,
        session_type: sessionType,
        session_id: sessionId,
        minutes_used: minutes,
        messages_count: messages,
        ended_at: body.ended ? new Date().toISOString() : null,
      });
      if (error) throw error;

      if (minutes > 0 && isVoiceSessionType(sessionType)) {
        await supabase.rpc("increment_voice_usage", { p_user_id: userId, p_minutes: minutes });
      }
      return json({ success: true });
    }

    if (action === "text_message") {
      const { data, error } = await supabase.rpc("can_send_text_message", { p_student_id: userId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (row && row.can_send === false) {
        return json({ success: false, reason: "limit_reached", ...row }, 429);
      }
      const { data: limits } = await supabase
        .from("student_usage_limits")
        .select("text_messages_used_current_month")
        .eq("student_id", userId)
        .maybeSingle();
      await supabase
        .from("student_usage_limits")
        .update({
          text_messages_used_current_month: (limits?.text_messages_used_current_month ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", userId);
      return json({ success: true });
    }

    if (action === "certification_attempt") {
      const { data: limits } = await supabase
        .from("student_usage_limits")
        .select("certification_attempts_used_current_semester, certification_attempts_semester_limit")
        .eq("student_id", userId)
        .maybeSingle();

      const used = limits?.certification_attempts_used_current_semester ?? 0;
      const limit = limits?.certification_attempts_semester_limit ?? 3;
      if (used >= limit) return json({ success: false, reason: "limit_reached", used, limit }, 429);

      await supabase
        .from("student_usage_limits")
        .update({
          certification_attempts_used_current_semester: used + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", userId);
      return json({ success: true, used: used + 1, limit });
    }

    if (action === "api_call") {
      const { error } = await supabase.from("api_calls_tracking").insert({
        user_id: userId,
        api_type: typeof body.api_type === "string" ? body.api_type.slice(0, 60) : "unknown",
        service: typeof body.service === "string" ? body.service.slice(0, 60) : null,
        endpoint: typeof body.endpoint === "string" ? body.endpoint.slice(0, 120) : null,
        tokens_used: Math.min(1_000_000, Math.max(0, Number(body.tokens_used) || 0)),
      });
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("track-usage error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
