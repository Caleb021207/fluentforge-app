import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";

/**
 * Server-side writer for certification attempts / transcripts / language metrics.
 * The matching tables are readable-only for students; all writes come through here
 * so a student cannot fabricate a score or CEFR level from the browser.
 */

const CERT_TYPES = ["reading", "writing", "speaking", "listening", "fluency", "pronunciation"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function clampScore(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

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

    if (action === "create") {
      const attempts = Array.isArray(body.attempts) ? body.attempts : [];
      if (!attempts.length || attempts.length > 5) return json({ error: "Invalid attempts" }, 400);

      const rows = attempts.map((a: any) => {
        if (!CERT_TYPES.includes(a.certification_type)) throw new Error("Invalid certification_type");
        return {
          user_id: userId,
          certification_type: a.certification_type,
          score: clampScore(a.score ?? 0),
          level: LEVELS.includes(a.level) ? a.level : "A1",
          completed_at: a.completed ? new Date().toISOString() : null,
        };
      });

      const { data, error } = await supabase.from("certification_attempts").insert(rows).select();
      if (error) throw error;
      return json({ success: true, attempts: data });
    }

    if (action === "complete") {
      const updates = Array.isArray(body.updates) ? body.updates : [];
      if (!updates.length || updates.length > 5) return json({ error: "Invalid updates" }, 400);

      for (const u of updates) {
        if (typeof u.id !== "string") return json({ error: "Invalid attempt id" }, 400);
        const { error } = await supabase
          .from("certification_attempts")
          .update({
            score: clampScore(u.score),
            level: LEVELS.includes(u.level) ? u.level : "A1",
            completed_at: new Date().toISOString(),
          })
          .eq("id", u.id)
          .eq("user_id", userId); // ownership enforced server-side
        if (error) throw error;
      }
      return json({ success: true });
    }

    if (action === "save_transcript") {
      const { attempt_id, user_transcripts, ai_responses } = body;
      if (typeof attempt_id !== "string") return json({ error: "attempt_id required" }, 400);

      const { data: owned } = await supabase
        .from("certification_attempts")
        .select("id")
        .eq("id", attempt_id)
        .eq("user_id", userId)
        .maybeSingle();
      if (!owned) return json({ error: "Attempt not found" }, 404);

      const { data, error } = await supabase
        .from("certification_transcripts")
        .insert({
          attempt_id,
          user_id: userId,
          user_transcripts: user_transcripts ?? [],
          ai_responses: ai_responses ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, transcript: data });
    }

    if (action === "language_metric") {
      const { error } = await supabase.from("student_language_metrics").insert({
        user_id: userId,
        session_id: typeof body.session_id === "string" ? body.session_id.slice(0, 120) : null,
        pronunciation_accuracy: body.pronunciation_accuracy == null ? null : clampScore(body.pronunciation_accuracy),
        grammar_accuracy: body.grammar_accuracy == null ? null : clampScore(body.grammar_accuracy),
        conversation_complexity: body.conversation_complexity == null ? null : clampScore(body.conversation_complexity),
        fluency_score: body.fluency_score == null ? null : clampScore(body.fluency_score),
        vocabulary_diversity: body.vocabulary_diversity == null ? null : clampScore(body.vocabulary_diversity),
      });
      if (error) throw error;
      await supabase.rpc("recalculate_student_metrics", { target_student_id: userId });
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("record-certification-attempt error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
