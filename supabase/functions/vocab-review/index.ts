import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";
import { awardXp, touchStreak, XP } from "../_shared/learnerProgress.ts";
import { DESIRED_RETENTION, cardToRow, rowToCard, schedule } from "../_shared/fsrs.ts";

/**
 * Vocabulary spaced repetition (FSRS).
 *
 *  action=queue  -> today's due cards, seeded from the vocabulary attached to
 *                   the learner's published lessons. Never returns anything
 *                   the learner has not been taught.
 *  action=grade  -> schedules the next review with FSRS, writes card_state +
 *                   review_log, and pays XP/streak for real review work.
 */

function service() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

const MAX_NEW_PER_DAY = 10;
const MAX_QUEUE = 30;

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const gate = await guardPaidRequest(req, corsHeaders, "vocab-review", 800);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  try {
    const body = await req.json().catch(() => ({}));
    const action: string = body?.action ?? "queue";
    const db = service();

    /* -------------------------------------------------------------- queue */
    if (action === "queue") {
      // Vocabulary the learner has actually been taught: mapped to lessons
      // THIS learner has started or completed. (Previously this pulled from
      // every published lesson, handing brand-new learners C1 vocabulary.)
      const { data: progressRows } = await db
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId);
      const lessonIds = [...new Set((progressRows ?? []).map((p: Record<string, any>) => p.lesson_id))];

      const { data: mapRows } = await db
        .from("vocab_lesson_map")
        .select("vocabulary_id, lesson_id")
        .in("lesson_id", lessonIds.length ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);
      const taughtFromLessons = (mapRows ?? []).map((m: Record<string, any>) => m.vocabulary_id);

      // Words the learner already has review history for stay in the deck even
      // if their source lesson mapping changes.
      const { data: existingStates } = await db
        .from("vocab_card_state")
        .select("vocabulary_id")
        .eq("user_id", userId);
      const taughtIds = [
        ...new Set([
          ...taughtFromLessons,
          ...(existingStates ?? []).map((s: Record<string, any>) => s.vocabulary_id),
        ]),
      ];

      if (!taughtIds.length) return json({ cards: [], due: 0, new: 0, retention: DESIRED_RETENTION });

      const { data: states } = await db
        .from("vocab_card_state")
        .select("*")
        .eq("user_id", userId)
        .in("vocabulary_id", taughtIds);

      const stateBy = new Map((states ?? []).map((s: Record<string, any>) => [s.vocabulary_id, s]));
      const now = Date.now();

      const dueIds = (states ?? [])
        .filter((s: Record<string, any>) => Date.parse(s.due) <= now)
        .sort((a: Record<string, any>, b: Record<string, any>) => Date.parse(a.due) - Date.parse(b.due))
        .map((s: Record<string, any>) => s.vocabulary_id);

      const newIds = taughtIds.filter((id) => !stateBy.has(id)).slice(0, MAX_NEW_PER_DAY);
      const queueIds = [...dueIds, ...newIds].slice(0, MAX_QUEUE);
      if (!queueIds.length) return json({ cards: [], due: 0, new: 0, retention: DESIRED_RETENTION });

      const { data: vocab } = await db
        .from("vocabulary")
        .select("id, lemma, translation_l1, part_of_speech, cefr_level, example_sentence, ipa, frequency_rank")
        .in("id", queueIds);

      const vocabBy = new Map((vocab ?? []).map((v: Record<string, any>) => [v.id, v]));
      const cards = queueIds
        .filter((id) => vocabBy.has(id))
        .map((id) => {
          const s = stateBy.get(id) as Record<string, any> | undefined;
          return {
            vocabulary: vocabBy.get(id),
            state: s ? s.state : 0,
            due: s ? s.due : null,
            reps: s ? s.reps : 0,
            lapses: s ? s.lapses : 0,
            is_new: !s,
          };
        });

      return json({ cards, due: dueIds.length, new: newIds.length, retention: DESIRED_RETENTION });
    }

    /* -------------------------------------------------------------- grade */
    if (action === "grade") {
      const vocabularyId: string | undefined = body?.vocabulary_id;
      const rating = Number(body?.rating);
      if (!vocabularyId || !/^[0-9a-f-]{36}$/i.test(vocabularyId)) {
        return json({ error: "A valid vocabulary_id is required" }, 400);
      }
      if (![1, 2, 3, 4].includes(rating)) return json({ error: "rating must be 1-4" }, 400);

      const { data: vocab } = await db
        .from("vocabulary")
        .select("id")
        .eq("id", vocabularyId)
        .maybeSingle();
      if (!vocab) return json({ error: "Vocabulary word not found" }, 404);

      const { data: existing } = await db
        .from("vocab_card_state")
        .select("*")
        .eq("user_id", userId)
        .eq("vocabulary_id", vocabularyId)
        .maybeSingle();

      const now = new Date();
      const card = rowToCard(existing ?? null, now);
      const { card: next, log } = schedule(card, rating, now);

      await db
        .from("vocab_card_state")
        .upsert(cardToRow(userId, vocabularyId, next), { onConflict: "user_id,vocabulary_id" });

      await db.from("vocab_review_log").insert({
        user_id: userId,
        vocabulary_id: vocabularyId,
        ...log,
      });

      const amount = rating === 1 ? XP.vocab_review_lapse : XP.vocab_review;
      const xp = await awardXp(db, userId, "vocab_review", amount, {
        type: "vocabulary",
        id: vocabularyId,
        metadata: { rating },
      });
      const streak = await touchStreak(db, userId);

      return json({
        due: new Date(next.due).toISOString(),
        scheduled_days: next.scheduled_days,
        stability: next.stability,
        difficulty: next.difficulty,
        state: next.state,
        xp_awarded: xp.awarded,
        streak,
      });
    }

    return json({ error: `Unsupported action: ${action}` }, 400);
  } catch (error) {
    console.error("vocab-review error", error);
    return json({ error: (error as Error).message ?? "Review failed" }, 500);
  }
});
