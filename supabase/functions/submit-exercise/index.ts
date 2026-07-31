import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";
import {
  awardXp,
  computeMastery,
  touchStreak,
  XP,
  preferOperational,
} from "../_shared/learnerProgress.ts";
import { GRADER_VERSION, getGrader, gradeAttempt, type GradeResult } from "../_shared/graders.ts";

/**
 * Authoritative exercise grading — the single writer for progress side effects.
 *
 * The browser submits only what it picked/typed/ordered; the answer key is read
 * here, server-side, and the resulting attempt, skill mastery, lesson progress,
 * XP and streak are all written with the service role. Grading dispatches
 * through the pure Tier-0 registry in _shared/graders.ts (plan 06 §E2/§E10):
 *
 *  - New primitives (cloze / word_retrieval / chunk_retrieval /
 *    sentence_construction / error_correction, and meaning_recognition) read a
 *    server-only `exercise_answer_keys` row (06 §2.3) and are graded by
 *    primitive. Partial credit lands in exercise_attempts.score.
 *  - Legacy MCQ (options only, no answer-key row) is graded through the same
 *    registry via the meaning_recognition grader built from exercise_options —
 *    byte-behavior-compatible with the previous option-match path.
 *
 * The progress pipeline (attempt insert → mastery → lesson progress → anti-grind
 * XP → streak) is unchanged and keys off the boolean pass verdict `grade.correct`.
 */

function service() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

// deno-lint-ignore no-explicit-any
type Db = any;

/** Client-safe response envelope (06 §2.1). Never carries key material. */
interface AttemptResponse {
  selected_option?: string | null;
  text?: string;
  tokens?: string[];
  ordered_tokens?: string[];
  ordered_texts?: string[];
  blanks?: Record<string, string>;
  selected_tokens?: string[];
  corrections?: Record<string, string>;
}

/**
 * Insert an attempt row. Writes the partial-credit / provenance columns added
 * by migration 20260731021000; if the live DB has not applied that migration
 * yet, falls back to the legacy column set so grading is never blocked
 * (dual-write window, 06 §5 "Migration of legacy MCQ").
 */
async function insertAttempt(
  db: Db,
  base: Record<string, unknown>,
  extra: Record<string, unknown>,
) {
  const { error } = await db.from("exercise_attempts").insert({ ...base, ...extra });
  if (error && /column|schema cache|does not exist/i.test(error.message ?? "")) {
    await db.from("exercise_attempts").insert(base);
  }
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const gate = await guardPaidRequest(req, corsHeaders, "submit-exercise", 800);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  try {
    const body = await req.json().catch(() => ({}));
    const exerciseId: string | undefined = body?.exercise_id;
    const optionId: string | null = body?.option_id ?? null;
    const responseMs = Number.isFinite(body?.response_ms) ? Math.max(0, Math.round(body.response_ms)) : null;
    const hintLevel = Number.isFinite(body?.hint_level) ? Math.max(0, Math.round(body.hint_level)) : 0;

    // The typed/ordered/etc. response; legacy MCQ callers send only option_id.
    const response: AttemptResponse =
      body?.response && typeof body.response === "object"
        ? body.response
        : optionId != null
          ? { selected_option: optionId }
          : {};

    if (!exerciseId || !/^[0-9a-f-]{36}$/i.test(exerciseId)) {
      return json({ error: "A valid exercise_id is required" }, 400);
    }

    const db = service();

    const { data: exercise } = await db
      .from("exercises")
      .select("id, lesson_id, difficulty, status, type, lessons:lesson_id (id, skill_id)")
      .eq("id", exerciseId)
      .maybeSingle();
    if (!exercise) return json({ error: "Exercise not found" }, 404);
    if (!["operational", "gated"].includes(exercise.status)) {
      return json({ error: "Exercise is not published" }, 403);
    }

    const lessonId = exercise.lesson_id as string;
    const skillId = (exercise as Record<string, any>).lessons?.skill_id as string | undefined;

    // ---- resolve the server-only answer key + grading primitive ----
    // Preferred: the exercise_answer_keys store (06 §2.3). If that table has not
    // been provisioned yet (live DB pre-migration), fall back to legacy MCQ
    // grading from exercise_options so nothing regresses during the window.
    let primitive: string | null = null;
    let key: Record<string, any> = {};
    let legacyRationale: string | null = null;
    let legacyCorrectOptionId: string | null = null;

    let keyRow: Record<string, any> | null = null;
    try {
      const { data, error } = await db
        .from("exercise_answer_keys")
        .select("primitive, key, grading, grader_version")
        .eq("exercise_id", exerciseId)
        .maybeSingle();
      if (!error) keyRow = data;
    } catch {
      /* table absent on the live DB yet — legacy path handles it */
    }

    if (keyRow) {
      primitive = String(keyRow.primitive ?? "");
      if (!getGrader(primitive)) {
        // Authored with a primitive this deploy cannot grade (e.g. a Tier-1/2
        // voice/AI type). Never silently mark the learner wrong.
        return json({ error: "This exercise type is not yet gradable", primitive }, 422);
      }
      // Per-item key knobs win; the grading block supplies defaults (06 §5).
      key = { ...(keyRow.grading ?? {}), ...(keyRow.key ?? {}) };
      legacyCorrectOptionId = key.correct_option ?? null;
    } else {
      // ---- legacy MCQ: build a meaning_recognition key from exercise_options ----
      const { data: options } = await db
        .from("exercise_options")
        .select("id, is_correct, rationale, label")
        .eq("exercise_id", exerciseId);
      const correct = (options ?? []).find((o: Record<string, any>) => o.is_correct);
      if (!correct) return json({ error: "This exercise has no answer key" }, 409);
      primitive = "meaning_recognition";
      key = { correct_option: correct.id };
      legacyRationale = correct.rationale ?? null;
      legacyCorrectOptionId = correct.id;
    }

    // ---- grade against the key (never trusting the client) ----
    let grade: GradeResult;
    try {
      grade = gradeAttempt(primitive, response, key);
    } catch (e) {
      console.error("grade dispatch failed", primitive, e);
      return json({ error: "This exercise type is not yet gradable", primitive }, 422);
    }
    const isCorrect = grade.correct;

    const { data: priorCorrect } = await db
      .from("exercise_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId)
      .eq("is_correct", true)
      .limit(1)
      .maybeSingle();

    await insertAttempt(
      db,
      {
        user_id: userId,
        exercise_id: exerciseId,
        lesson_id: lessonId,
        skill_id: skillId ?? null,
        is_correct: isCorrect,
        selected_option_id: response.selected_option ?? null,
        difficulty: exercise.difficulty,
        response_ms: responseMs,
      },
      {
        score: grade.score,
        passed: isCorrect,
        hint_level: hintLevel,
        tier: 0,
        grader_version: GRADER_VERSION,
        response,
      },
    );

    // ---- skill mastery + adaptive ability (signature unchanged) ----
    let masteryState: ReturnType<typeof computeMastery> | null = null;
    if (skillId) {
      const { data: row } = await db
        .from("skill_mastery")
        .select("mastery, ability, attempts, correct, recent_window")
        .eq("user_id", userId)
        .eq("skill_id", skillId)
        .maybeSingle();

      masteryState = computeMastery(row, isCorrect);
      await db.from("skill_mastery").upsert(
        {
          user_id: userId,
          skill_id: skillId,
          mastery: masteryState.mastery,
          ability: masteryState.ability,
          attempts: masteryState.attempts,
          correct: masteryState.correct,
          recent_window: masteryState.window,
          last_practiced_at: new Date().toISOString(),
        },
        { onConflict: "user_id,skill_id" },
      );
    }

    // ---- lesson progress ----
    const { data: lessonExercises } = await db
      .from("exercises")
      .select("id, status")
      .eq("lesson_id", lessonId)
      .in("status", ["operational", "gated"]);
    const publishedIds = preferOperational((lessonExercises ?? []) as Array<{ status: string }>).map(
      (e: Record<string, any>) => e.id,
    );

    const { data: correctAttempts } = await db
      .from("exercise_attempts")
      .select("exercise_id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .eq("is_correct", true);
    const distinctCorrect = new Set((correctAttempts ?? []).map((a: Record<string, any>) => a.exercise_id));
    const solved = publishedIds.filter((id: string) => distinctCorrect.has(id)).length;
    const lessonComplete = publishedIds.length > 0 && solved >= publishedIds.length;

    const { data: existingProgress } = await db
      .from("lesson_progress")
      .select("attempts, correct, status, completed_at")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    const attempts = (existingProgress?.attempts ?? 0) + 1;
    const correct = (existingProgress?.correct ?? 0) + (isCorrect ? 1 : 0);
    const alreadyComplete = !!existingProgress?.completed_at;

    await db.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: lessonComplete ? "completed" : "in_progress",
        attempts,
        correct,
        accuracy: Number((correct / attempts).toFixed(4)),
        last_exercise_id: exerciseId,
        completed_at: lessonComplete
          ? existingProgress?.completed_at ?? new Date().toISOString()
          : existingProgress?.completed_at ?? null,
      },
      { onConflict: "user_id,lesson_id" },
    );

    // ---- XP: rewarded for real progress, not for repeat taps ----
    let xpAwarded = 0;
    const xpDetail: string[] = [];
    if (isCorrect && !priorCorrect) {
      const r = await awardXp(db, userId, "exercise_first_correct", XP.exercise_first_correct, {
        type: "exercise",
        id: exerciseId,
      });
      xpAwarded += r.awarded;
      xpDetail.push("first correct answer");
    }
    if (lessonComplete && !alreadyComplete) {
      const r = await awardXp(db, userId, "lesson_complete", XP.lesson_complete, {
        type: "lesson",
        id: lessonId,
      });
      xpAwarded += r.awarded;
      xpDetail.push("lesson completed");
    }
    if (masteryState?.newlyMastered && skillId) {
      const r = await awardXp(db, userId, "skill_mastered", XP.skill_mastered, {
        type: "skill",
        id: skillId,
      });
      xpAwarded += r.awarded;
      xpDetail.push("skill mastered");
    }

    // Streaks advance only when the learner actually moved mastery forward.
    let streak = null;
    if (xpAwarded > 0) streak = await touchStreak(db, userId);

    return json({
      correct: isCorrect,
      // Continuous grade + revealed answer are post-grade only (06 §2.1).
      score: grade.score,
      passed: isCorrect,
      correct_option_id: legacyCorrectOptionId,
      expected: grade.expected ?? null,
      feedback: grade.feedback ?? null,
      partials: grade.partials ?? null,
      // The rationale is only revealed *after* the answer is graded.
      explanation: legacyRationale ?? null,
      mastery: masteryState
        ? {
            mastery: masteryState.mastery,
            ability: masteryState.ability,
            mastered: masteryState.mastered,
            newly_mastered: masteryState.newlyMastered,
          }
        : null,
      lesson: { complete: lessonComplete, solved, total: publishedIds.length },
      xp_awarded: xpAwarded,
      xp_reasons: xpDetail,
      streak,
    });
  } catch (error) {
    console.error("submit-exercise error", error);
    return json({ error: (error as Error).message ?? "Grading failed" }, 500);
  }
});
