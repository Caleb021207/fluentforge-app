import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import {
  AUTHOR_MODEL,
  generateItems,
  runGauntlet,
  failureReasons,
  readabilityGrade,
  wordCount,
  levelGate,
  biasGate,
} from "../_shared/authoring.ts";
import { SEED_UNITS, SEED_VOCAB, CAN_DO_STATEMENTS } from "../_shared/seedCurriculum.ts";

/**
 * One-shot seeder for the starter English/ESL curriculum (grades 6-8).
 *
 * Builds the course > unit > skill > lesson tree, the frequency-ranked
 * vocabulary set, the can-do spine and the passages, then authors exercises
 * through the same gauntlet used by /author and reports the real funnel.
 *
 * Callable by an admin JWT, or by an operator holding the SEED_TOKEN secret.
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

  const db = service();

  // --- authorization: SEED_TOKEN operator, or an admin JWT ---
  const seedToken = Deno.env.get("SEED_TOKEN");
  const presented = req.headers.get("x-seed-token");
  let authorized = !!seedToken && !!presented && presented === seedToken;

  if (!authorized) {
    const gate = await requireUser(req, corsHeaders);
    if (gate.error) return gate.error;
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: gate.userId, _role: "admin" });
    authorized = isAdmin === true;
  }
  if (!authorized) return json({ error: "Admin role required" }, 403);

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run === true;

    // Idempotency: reuse the course if it already exists.
    const { data: existingCourse } = await db
      .from("courses")
      .select("id")
      .eq("title", "English Foundations A1–B1")
      .maybeSingle();
    if (existingCourse && body?.resume) {
      // Resume mode: the structure exists; top up missing exercises a few
      // lessons at a time so each invocation stays inside the request budget.
      const maxLessons = Math.min(Number(body?.max_lessons) || 1, 3);
      const resumeFunnel = {
        lessons_processed: [] as string[],
        exercises_generated: 0,
        exercises_gated: 0,
        exercises_draft: 0,
        failures: [] as string[],
        remaining_lessons: 0,
      };
      const knownVocabResume = SEED_VOCAB.map((v) => v.lemma);

      for (const u of SEED_UNITS) {
        const { data: unitRow } = await db
          .from("units").select("id").eq("course_id", existingCourse.id).eq("title", u.title).maybeSingle();
        if (!unitRow) continue;
        const { data: passageRow } = u.passage
          ? await db.from("passages").select("id").eq("title", u.passage.title).maybeSingle()
          : { data: null as any };

        for (const s of u.skills) {
          const { data: skillRow } = await db
            .from("skills").select("id").eq("unit_id", unitRow.id).eq("title", s.title).maybeSingle();
          if (!skillRow) continue;

          for (const l of s.lessons) {
            const { data: lessonRow } = await db
              .from("lessons").select("id").eq("skill_id", skillRow.id).eq("title", l.title).maybeSingle();
            if (!lessonRow) continue;

            const { data: haveRows } = await db
              .from("exercises").select("id, type, position").eq("lesson_id", lessonRow.id);
            const have = haveRows ?? [];
            const missing = l.generate
              .map((g) => ({ type: g.type, count: g.count - have.filter((e: any) => e.type === g.type).length }))
              .filter((g) => g.count > 0);
            if (!missing.length) continue;

            if (resumeFunnel.lessons_processed.length >= maxLessons) {
              resumeFunnel.remaining_lessons++;
              continue;
            }
            resumeFunnel.lessons_processed.push(`${u.title} › ${l.title}`);

            const ctx = {
              cefr_level: u.cefr_level,
              wida_level: u.wida_level,
              can_do_statement: u.can_do_statement,
              content_objective: u.content_objective,
              language_objective: u.language_objective,
              key_language_use: u.key_language_use,
              unit_title: u.title,
              skill_title: s.title,
              skill_type: s.type,
              grammar_point: s.target_grammar_point,
              known_vocab: knownVocabResume,
            };

            const existingItems: Array<{ text: string; vector?: number[] }> = [];
            let pos = have.length;

            for (const gen of missing) {
              const items = await generateItems(ctx, gen.type, gen.count);
              for (const item of items) {
                const { results, vector } = await runGauntlet(item, ctx, existingItems);
                const passedAll = results.passed_all as unknown as boolean;
                const reasons = failureReasons(results);
                resumeFunnel.exercises_generated++;
                passedAll ? resumeFunnel.exercises_gated++ : resumeFunnel.exercises_draft++;
                if (reasons.length) resumeFunnel.failures.push(`${gen.type} "${item.prompt.slice(0, 45)}": ${reasons[0]}`);

                const { data: exercise, error: exErr } = await db
                  .from("exercises")
                  .insert({
                    lesson_id: lessonRow.id,
                    position: pos++,
                    type: gen.type,
                    prompt: item.prompt,
                    passage_id: ["listening_mc", "dictation"].includes(gen.type) || s.type === "reading"
                      ? passageRow?.id ?? null
                      : null,
                    difficulty: typeof item.difficulty === "number" ? item.difficulty : null,
                    receptive_productive: item.receptive_productive === "productive" ? "productive" : "receptive",
                    source_model: AUTHOR_MODEL,
                    status: passedAll ? "gated" : "draft",
                    gate_results: { ...results, failures: reasons, learning_point: item.learning_point ?? null },
                  })
                  .select()
                  .single();
                if (exErr) { console.error("resume insert failed", exErr); continue; }

                const options = (item.options ?? []).filter((o: any) => o?.label?.trim());
                if (options.length) {
                  await db.from("exercise_options").insert(
                    options.map((o: any, i: number) => ({
                      exercise_id: exercise.id,
                      label: o.label,
                      is_correct: !!o.is_correct,
                      position: i,
                      rationale: o.rationale ?? null,
                    })),
                  );
                }
                if (vector) existingItems.push({ text: item.prompt, vector });
              }
            }
          }
        }
      }

      console.log("[seed-curriculum] resume funnel", JSON.stringify(resumeFunnel));
      return json({ success: true, mode: "resume", course_id: existingCourse.id, funnel: resumeFunnel });
    }

    if (existingCourse && !body?.force) {
      return json({ error: "Curriculum already seeded", course_id: existingCourse.id }, 409);
    }


    // ---- can-do spine ----
    const { data: canDos } = await db
      .from("can_do_statements")
      .insert(CAN_DO_STATEMENTS)
      .select("id, framework, level, skill_or_mode");

    // ---- vocabulary ----
    const { data: vocab, error: vocabErr } = await db
      .from("vocabulary")
      .insert(SEED_VOCAB.map((v) => ({ ...v, language: "en" })))
      .select("id, lemma");
    if (vocabErr) throw vocabErr;
    const vocabByLemma = new Map((vocab ?? []).map((v: any) => [v.lemma, v.id]));
    const knownVocab = SEED_VOCAB.map((v) => v.lemma);

    // ---- course ----
    const { data: course, error: courseErr } = await db
      .from("courses")
      .insert({
        language: "en",
        target_framework: "CEFR",
        level_band: "A1–B1",
        title: "English Foundations A1–B1",
        description: "Structured English/ESL curriculum for grades 6–8, aligned to CEFR A1–B1 and WIDA levels 1–5.",
        status: "operational",
      })
      .select()
      .single();
    if (courseErr) throw courseErr;

    const funnel = {
      exercises_generated: 0,
      exercises_gated: 0,
      exercises_draft: 0,
      passages_generated: 0,
      passages_gated: 0,
      passages_draft: 0,
      by_type: {} as Record<string, { generated: number; gated: number; draft: number }>,
      failures: [] as string[],
    };

    let unitPos = 0;
    for (const u of SEED_UNITS) {
      const { data: unit, error: unitErr } = await db
        .from("units")
        .insert({
          course_id: course.id,
          position: unitPos++,
          title: u.title,
          theme: u.theme,
          can_do_statement: u.can_do_statement,
          key_language_use: u.key_language_use,
          cefr_level: u.cefr_level,
          wida_level: u.wida_level,
          content_objective: u.content_objective,
          language_objective: u.language_objective,
          status: "operational",
        })
        .select()
        .single();
      if (unitErr) throw unitErr;

      // map the unit onto a can-do statement at a matching level
      const canDo = (canDos ?? []).find((c: any) => c.level === u.cefr_level) ?? (canDos ?? [])[0];
      if (canDo) {
        await db.from("content_can_do_map").insert({
          content_type: "unit",
          content_id: unit.id,
          can_do_id: canDo.id,
        });
      }

      // ---- passage (curated text, still level + bias gated) ----
      let passageId: string | null = null;
      if (u.passage) {
        const grade = readabilityGrade(u.passage.body);
        const [level, bias] = await Promise.all([
          levelGate(u.passage.body, u.cefr_level).catch((e) => ({ pass: false, detail: String(e) })),
          biasGate(u.passage.body).catch((e) => ({ pass: false, detail: String(e) })),
        ]);
        const passed = level.pass && bias.pass;
        funnel.passages_generated++;
        passed ? funnel.passages_gated++ : funnel.passages_draft++;
        if (!passed) funnel.failures.push(`passage "${u.passage.title}": ${!level.pass ? level.detail : bias.detail}`);

        // Listening audio is not synthesised in this build.
        const { data: asset } = u.passage.skill_type === "listening"
          ? await db.from("assets").insert({
              type: "audio",
              url: null,
              transcript: u.passage.body,
              meta: { status: "pending", reason: "TTS not run during seeding" },
            }).select().single()
          : { data: null as any };

        const { data: passage, error: pErr } = await db
          .from("passages")
          .insert({
            language: "en",
            skill_type: u.passage.skill_type,
            cefr_level: u.cefr_level,
            wida_level: u.wida_level,
            topic: u.passage.topic,
            key_language_use: u.key_language_use,
            title: u.passage.title,
            body: u.passage.body,
            word_count: wordCount(u.passage.body),
            readability_grade: grade,
            audio_asset_id: asset?.id ?? null,
            source_model: "curated",
            status: passed ? "operational" : "draft",
            gate_results: { level, bias, readability_grade: grade },
          })
          .select()
          .single();
        if (pErr) throw pErr;
        passageId = passage.id;
      }

      let skillPos = 0;
      for (const s of u.skills) {
        const { data: skill, error: sErr } = await db
          .from("skills")
          .insert({
            unit_id: unit.id,
            position: skillPos++,
            title: s.title,
            type: s.type,
            description: s.description,
            target_grammar_point: s.target_grammar_point,
            status: "operational",
          })
          .select()
          .single();
        if (sErr) throw sErr;

        let lessonPos = 0;
        for (const l of s.lessons) {
          const { data: lesson, error: lErr } = await db
            .from("lessons")
            .insert({
              skill_id: skill.id,
              position: lessonPos++,
              title: l.title,
              intro_md: l.intro_md,
              status: "operational",
            })
            .select()
            .single();
          if (lErr) throw lErr;

          const maps = l.vocab
            .map((w) => vocabByLemma.get(w))
            .filter(Boolean)
            .map((id) => ({ vocabulary_id: id, lesson_id: lesson.id }));
          if (maps.length) await db.from("vocab_lesson_map").insert(maps);

          if (dryRun) continue;

          const ctx = {
            cefr_level: u.cefr_level,
            wida_level: u.wida_level,
            can_do_statement: u.can_do_statement,
            content_objective: u.content_objective,
            language_objective: u.language_objective,
            key_language_use: u.key_language_use,
            unit_title: u.title,
            skill_title: s.title,
            skill_type: s.type,
            grammar_point: s.target_grammar_point,
            known_vocab: knownVocab,
          };

          const existing: Array<{ text: string; vector?: number[] }> = [];
          let exPos = 0;

          for (const gen of l.generate) {
            const items = await generateItems(ctx, gen.type, gen.count);
            const bucket = funnel.by_type[gen.type] ??= { generated: 0, gated: 0, draft: 0 };

            for (const item of items) {
              const { results, vector } = await runGauntlet(item, ctx, existing);
              const passedAll = results.passed_all as unknown as boolean;
              const reasons = failureReasons(results);

              funnel.exercises_generated++;
              bucket.generated++;
              passedAll ? (funnel.exercises_gated++, bucket.gated++) : (funnel.exercises_draft++, bucket.draft++);
              if (reasons.length) funnel.failures.push(`${gen.type} "${item.prompt.slice(0, 45)}": ${reasons[0]}`);

              const { data: exercise, error: exErr } = await db
                .from("exercises")
                .insert({
                  lesson_id: lesson.id,
                  position: exPos++,
                  type: gen.type,
                  prompt: item.prompt,
                  passage_id: ["listening_mc", "dictation"].includes(gen.type) || s.type === "reading" ? passageId : null,
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

              const options = (item.options ?? []).filter((o: any) => o?.label?.trim());
              if (options.length) {
                await db.from("exercise_options").insert(
                  options.map((o: any, i: number) => ({
                    exercise_id: exercise.id,
                    label: o.label,
                    is_correct: !!o.is_correct,
                    position: i,
                    rationale: o.rationale ?? null,
                  })),
                );
              }
              if (vector) existing.push({ text: item.prompt, vector });
            }
          }
        }
      }
    }

    console.log("[seed-curriculum] funnel", JSON.stringify(funnel));
    return json({ success: true, course_id: course.id, funnel });
  } catch (error) {
    console.error("seed-curriculum error", error);
    return json({ error: (error as Error).message ?? "Seeding failed" }, 500);
  }
});
