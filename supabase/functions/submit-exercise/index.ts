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

/**
 * Authoritative exercise grading.
 *
 * The browser submits only the option it picked; the answer key is read here,
 * server-side, and the resulting attempt, skill mastery, lesson progress, XP
 * and streak are all written with the service role.
 */

function service() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
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

    // ---- grade against the server-only answer key ----
    const { data: options } = await db
      .from("exercise_options")
      .select("id, is_correct, rationale, label")
      .eq("exercise_id", exerciseId);

    const key = (options ?? []).find((o: Record<string, any>) => o.is_correct);
    if (!key) return json({ error: "This exercise has no answer key" }, 409);

    const isCorrect = optionId === key.id;

    const { data: priorCorrect } = await db
      .from("exercise_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId)
      .eq("is_correct", true)
      .limit(1)
      .maybeSingle();

    await db.from("exercise_attempts").insert({
      user_id: userId,
      exercise_id: exerciseId,
      lesson_id: lessonId,
      skill_id: skillId ?? null,
      is_correct: isCorrect,
      selected_option_id: optionId,
      difficulty: exercise.difficulty,
      response_ms: responseMs,
    });

    // ---- skill mastery + adaptive ability ----
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
      correct_option_id: key.id,
      // The rationale is only revealed *after* the answer is graded.
      explanation: isCorrect ? key.rationale ?? null : key.rationale ?? null,
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
