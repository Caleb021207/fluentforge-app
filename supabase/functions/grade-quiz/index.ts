import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { READING_ANSWER_KEY, normalizeQuestion } from "../_shared/quizAnswerKey.ts";

/**
 * Authoritative server-side grader for the reading / placement quizzes.
 *
 * The browser only submits the question text and the option index the learner
 * picked. The correct answers live in `_shared/quizAnswerKey.ts`, which never
 * reaches the client bundle, so a student cannot submit a fabricated score.
 */

const LEVEL_THRESHOLDS: Array<[number, string]> = [
  [95, "C2"],
  [88, "C1"],
  [78, "B2"],
  [65, "B1"],
  [50, "A2"],
  [0, "A1"],
];

function determineLevel(score: number): string {
  for (const [min, level] of LEVEL_THRESHOLDS) {
    if (score >= min) return level;
  }
  return "A1";
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const gate = await requireUser(req, corsHeaders);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  try {
    const body = await req.json();
    const quizType = body?.quiz_type === "placement" ? "placement" : "reading";
    const persist = body?.persist !== false && quizType === "reading";
    const answers = Array.isArray(body?.answers) ? body.answers : [];

    if (!answers.length || answers.length > 200) {
      return json({ error: "Invalid answers payload" }, 400);
    }

    let graded = 0;
    let correct = 0;
    const unknown: string[] = [];

    for (const a of answers) {
      const text = typeof a?.question === "string" ? a.question : "";
      const entry = READING_ANSWER_KEY.get(normalizeQuestion(text));
      if (!entry) {
        unknown.push(text.slice(0, 80));
        continue;
      }
      graded += 1;
      if (Number(a?.selected) === entry.correctAnswer) correct += 1;
    }

    if (graded === 0) {
      return json({ error: "No gradable questions were recognised" }, 400);
    }

    const score = Math.round((correct / graded) * 100);
    const level = determineLevel(score);

    let attemptId: string | null = null;
    if (persist) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data, error } = await supabase
        .from("certification_attempts")
        .insert({
          user_id: userId,
          certification_type: "reading",
          score,
          level,
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      attemptId = data?.id ?? null;
    }

    if (unknown.length) {
      console.warn(`[grade-quiz] ${unknown.length} unrecognised questions skipped`);
    }

    return json({
      success: true,
      score,
      level,
      correct,
      graded,
      skipped: unknown.length,
      attempt_id: attemptId,
    });
  } catch (error) {
    console.error("grade-quiz error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
