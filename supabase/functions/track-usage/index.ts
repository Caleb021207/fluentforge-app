import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";

/**
 * Server-side writer for usage/quota data.
 * `usage_tracking`, `api_calls_tracking` and `student_usage_limits` are no longer
 * client-writable — otherwise a student could raise their own monthly quota.
 */

const SESSION_TYPES = ["text_practice", "voice_practice", "premium_voice_practice", "pronunciation", "lesson"];

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
      const sessionType = SESSION_TYPES.includes(body.session_type) ? body.session_type : "text_practice";
      const minutes = Math.min(240, Math.max(0, Number(body.minutes_used) || 0));
      const messages = Math.min(1000, Math.max(0, Number(body.messages_count) || 0));

      const { error } = await supabase.from("usage_tracking").insert({
        student_id: userId,
        session_type: sessionType,
        session_id: typeof body.session_id === "string" ? body.session_id.slice(0, 120) : null,
        minutes_used: minutes,
        messages_count: messages,
        ended_at: body.ended ? new Date().toISOString() : null,
      });
      if (error) throw error;

      if (minutes > 0) {
        const rpc = sessionType === "premium_voice_practice" ? "increment_voice_usage" : "increment_voice_usage";
        await supabase.rpc(rpc, { p_user_id: userId, p_minutes: minutes });
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
