import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";
import {
  AUTHOR_MODEL,
  generateItems,
  runGauntlet,
  failureReasons,
  embed,
} from "../_shared/authoring.ts";

/**
 * Admin-only AI content-authoring endpoint.
 *
 * Generates exercises AGAINST an existing curriculum node (course > unit >
 * skill > lesson) and runs every generated item through the quality gauntlet
 * before it is allowed anywhere near a learner. Nothing is auto-published:
 * items that clear all gates land in 'gated' and still require human approval
 * in /author to become 'operational'.
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

  // Auth + per-user daily quota (paid model calls).
  const gate = await guardPaidRequest(req, corsHeaders, "author-content", 40);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  const db = service();

  const { data: isAdmin } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (isAdmin !== true) return json({ error: "Admin role required" }, 403);

  try {
    const body = await req.json();
    const lessonId: string | undefined = body?.scope?.lesson_id;
    const type: string = body?.type ?? "cloze";
    const count = Math.min(Math.max(Number(body?.count) || 3, 1), 8);

    const ALLOWED = [
      "flashcard", "cloze", "matching", "ordering", "dictation",
      "listening_mc", "speaking", "translation", "dialogue",
    ];
    if (!lessonId) return json({ error: "scope.lesson_id is required" }, 400);
    if (!ALLOWED.includes(type)) return json({ error: `Unsupported exercise type: ${type}` }, 400);

    // ---- load the structure the content must be authored against ----
    const { data: lesson, error: lessonErr } = await db
      .from("lessons")
      .select("id, title, skill_id, skills:skill_id (id, title, type, target_grammar_point, unit_id, units:unit_id (id, title, cefr_level, wida_level, can_do_statement, key_language_use, content_objective, language_objective))")
      .eq("id", lessonId)
      .single();
    if (lessonErr || !lesson) return json({ error: "Lesson not found" }, 404);

    const skill: any = (lesson as any).skills;
    const unit: any = skill?.units;
    if (!unit) return json({ error: "Lesson is not attached to a unit" }, 400);

    const { data: vocabRows } = await db
      .from("vocabulary")
      .select("lemma, cefr_level")
      .in("cefr_level", ["A1", "A2", unit.cefr_level].filter(Boolean))
      .limit(300);

    const ctx = {
      cefr_level: unit.cefr_level ?? "A1",
      wida_level: unit.wida_level,
      can_do_statement: unit.can_do_statement,
      content_objective: unit.content_objective,
      language_objective: unit.language_objective,
      key_language_use: unit.key_language_use,
      unit_title: unit.title,
      skill_title: skill?.title,
      skill_type: skill?.type,
      grammar_point: skill?.target_grammar_point,
      known_vocab: (vocabRows ?? []).map((v: any) => v.lemma),
    };

    // ---- existing content in the same skill, for the duplicate gate ----
    const { data: siblings } = await db
      .from("exercises")
      .select("prompt, lessons:lesson_id (skill_id)")
      .limit(40);
    const sameSkill = (siblings ?? []).filter((r: any) => r.lessons?.skill_id === skill?.id).slice(0, 20);
    const existing: Array<{ text: string; vector?: number[] }> = [];
    for (const s of sameSkill) {
      const vec = await embed(s.prompt);
      existing.push({ text: s.prompt, vector: vec ?? undefined });
    }

    // ---- (a) generate ----
    const items = await generateItems(ctx, type, count);
    if (!items.length) return json({ error: "The author model returned no usable items." }, 502);

    const { data: posRow } = await db
      .from("exercises")
      .select("position")
      .eq("lesson_id", lessonId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    let position = (posRow?.position ?? -1) + 1;

    const funnel = { generated: items.length, passed: 0, failed: 0 };
    const created: any[] = [];

    // ---- (b)-(f) gauntlet ----
    for (const item of items) {
      // The gauntlet branches on item type (e.g. flashcards are exempt from the
      // comprehensible-input budget), so never trust the model's own label.
      item.type = type;
      const { results, vector } = await runGauntlet(item, ctx, existing);
      const passedAll = results.passed_all as unknown as boolean;
      const reasons = failureReasons(results);

      const { data: exercise, error: exErr } = await db
        .from("exercises")
        .insert({
          lesson_id: lessonId,
          position: position++,
          type,
          prompt: item.prompt,
          difficulty: typeof item.difficulty === "number" ? item.difficulty : null,
          receptive_productive: item.receptive_productive === "productive" ? "productive" : "receptive",
          source_model: AUTHOR_MODEL,
          status: passedAll ? "gated" : "draft",
          gate_results: { ...results, failures: reasons, learning_point: item.learning_point ?? null },
        })
        .select()
        .single();
      if (exErr) {
        console.error("exercise insert failed", exErr);
        continue;
      }

      const options = (item.options ?? []).filter((o) => o?.label?.trim());
      if (options.length) {
        await db.from("exercise_options").insert(
          options.map((o, i) => ({
            exercise_id: exercise.id,
            label: o.label,
            is_correct: !!o.is_correct,
            position: i,
            rationale: o.rationale ?? null,
          })),
        );
      }

      if (vector) existing.push({ text: item.prompt, vector });
      passedAll ? funnel.passed++ : funnel.failed++;
      created.push({ id: exercise.id, status: exercise.status, failures: reasons });
    }

    console.log(
      `[author-content] lesson=${lessonId} type=${type} generated=${funnel.generated} gated=${funnel.passed} draft=${funnel.failed}`,
    );

    return json({ success: true, funnel, created });
  } catch (error) {
    console.error("author-content error", error);
    return json({ error: (error as Error).message ?? "Authoring failed" }, 500);
  }
});
