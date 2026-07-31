import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";
import { orderByAbility, preferOperational } from "../_shared/learnerProgress.ts";

/**
 * Serves a lesson's exercises to a learner.
 *
 * Two invariants:
 *  1. Answer keys never leave the server — option `is_correct` and `rationale`
 *     are stripped, options are shuffled, and any key-material fields are
 *     stripped from the client-safe `content` payload before it is returned.
 *  2. Only human-approved ('operational') content ships, falling back to
 *     gauntlet-passed ('gated') content when a lesson has not been reviewed.
 *
 * Each exercise also carries its grading `primitive` (read from the server-only
 * exercise_answer_keys store — the tag only, never the key) so the client can
 * dispatch the Wave-1 renderers; null when no key row exists (legacy MCQ).
 */

function service() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fields that must never reach the browser even if authored into `content` by
 * mistake — `content` is client-safe by design (06 §5); this is defense in
 * depth against key material leaking through the serve path.
 */
const KEY_MATERIAL_FIELDS = [
  "answer_key",
  "accept",
  "correct_option",
  "solutions",
  "solution_texts",
  "transcript",
  "key",
];

function stripKeyMaterial(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripKeyMaterial);
  if (value && typeof value === "object") {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (KEY_MATERIAL_FIELDS.includes(k)) continue;
      safe[k] = stripKeyMaterial(v);
    }
    return safe;
  }
  return value;
}

/** Client-safe render payload: key-material fields recursively removed. */
function sanitizeContent(content: unknown): Record<string, unknown> | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) return null;
  return stripKeyMaterial(content) as Record<string, unknown>;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const gate = await guardPaidRequest(req, corsHeaders, "learn-lesson", 400);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  try {
    const body = await req.json().catch(() => ({}));
    const lessonId: string | undefined = body?.lesson_id;
    if (!lessonId || !/^[0-9a-f-]{36}$/i.test(lessonId)) {
      return json({ error: "A valid lesson_id is required" }, 400);
    }

    const db = service();

    const { data: lesson, error: lessonErr } = await db
      .from("lessons")
      .select(
        "id, title, intro_md, status, position, skill_id, skills:skill_id (id, title, type, target_grammar_point, unit_id, units:unit_id (id, title, theme, cefr_level, wida_level, can_do_statement, content_objective, language_objective))",
      )
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonErr || !lesson) return json({ error: "Lesson not found" }, 404);
    if (!["operational", "gated"].includes(lesson.status)) {
      return json({ error: "This lesson is not published yet" }, 403);
    }

    const skill: Record<string, unknown> = (lesson as Record<string, any>).skills ?? {};
    const unit: Record<string, unknown> = (skill as Record<string, any>).units ?? {};

    // Learner ability drives adaptive ordering.
    const { data: mastery } = await db
      .from("skill_mastery")
      .select("mastery, ability, attempts, correct")
      .eq("user_id", userId)
      .eq("skill_id", skill.id as string)
      .maybeSingle();
    const ability = Number(mastery?.ability ?? 0.3);

    // The `content` render payload ships with the Phase-2 primitives; the live
    // DB may not have the column yet, so retry without it on a missing-column
    // error (same tolerant pattern as submit-exercise).
    const selectExercises = async (cols: string) => {
      const { data, error } = await db
        .from("exercises")
        .select(cols)
        .eq("lesson_id", lessonId)
        .in("status", ["operational", "gated"])
        .order("position", { ascending: true });
      return { data: data as Array<Record<string, any>> | null, error };
    };
    const baseCols =
      "id, position, type, prompt, difficulty, receptive_productive, status, passage_id";
    const optionCols = "exercise_options (id, label, position)";

    let { data: rawExercises, error: exercisesErr } = await selectExercises(
      `${baseCols}, content, ${optionCols}`,
    );
    if (exercisesErr && /column|schema cache|does not exist/i.test(exercisesErr.message ?? "")) {
      ({ data: rawExercises } = await selectExercises(`${baseCols}, ${optionCols}`));
    }

    const published = preferOperational((rawExercises ?? []) as Array<{ status: string }>) as Array<
      Record<string, any>
    >;

    // Grading primitive tags from the server-only key store — the tag only,
    // never `key`/`grading`. Tolerant of the table being absent on the live DB.
    const primitiveById = new Map<string, string>();
    if (published.length > 0) {
      try {
        const { data: keyRows, error: keysErr } = await db
          .from("exercise_answer_keys")
          .select("exercise_id, primitive")
          .in("exercise_id", published.map((e) => e.id));
        if (!keysErr) {
          for (const row of (keyRows ?? []) as Array<Record<string, any>>) {
            primitiveById.set(row.exercise_id, row.primitive);
          }
        }
      } catch {
        /* table absent on the live DB yet — primitive stays null */
      }
    }

    const exercises = orderByAbility(published, ability).map((e) => ({
      id: e.id,
      type: e.type,
      primitive: primitiveById.get(e.id) ?? null,
      prompt: e.prompt,
      difficulty: e.difficulty,
      receptive_productive: e.receptive_productive,
      content: sanitizeContent(e.content),
      // Answer key intentionally omitted: only id + label reach the browser.
      options: shuffle((e.exercise_options ?? []).map((o: Record<string, any>) => ({ id: o.id, label: o.label }))),
    }));

    let passage = null;
    const passageId = published.find((e) => e.passage_id)?.passage_id;
    if (passageId) {
      const { data: p } = await db
        .from("passages")
        .select("id, title, body, cefr_level, topic, status")
        .eq("id", passageId)
        .maybeSingle();
      if (p && ["operational", "gated"].includes(p.status)) passage = p;
    }

    const { data: progress } = await db
      .from("lesson_progress")
      .select("status, attempts, correct, accuracy, completed_at")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    return json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        intro_md: lesson.intro_md,
        skill: { id: skill.id, title: skill.title, type: skill.type },
        unit: {
          id: unit.id,
          title: unit.title,
          cefr_level: unit.cefr_level,
          can_do_statement: unit.can_do_statement,
          content_objective: unit.content_objective,
          language_objective: unit.language_objective,
        },
      },
      passage,
      exercises,
      ability,
      mastery: mastery?.mastery ?? 0,
      progress: progress ?? null,
    });
  } catch (error) {
    console.error("learn-lesson error", error);
    return json({ error: (error as Error).message ?? "Failed to load lesson" }, 500);
  }
});
