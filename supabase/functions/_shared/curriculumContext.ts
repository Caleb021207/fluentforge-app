/**
 * Curriculum awareness for the AI tutor.
 *
 * Resolves the learner's active unit (first unit that is not yet mastered),
 * their level and their weakest skills so chat and role-play can target the
 * can-do statement the learner is actually working on.
 */

export interface CurriculumSnapshot {
  unit_title: string | null;
  cefr_level: string | null;
  wida_level: number | null;
  can_do_statement: string | null;
  key_language_use: string | null;
  language_objective: string | null;
  target_vocab: string[];
  weak_skills: Array<{ title: string; type: string; mastery: number }>;
  due_reviews: number;
}

// deno-lint-ignore no-explicit-any
type Db = { from: (t: string) => any };

export async function getCurriculumSnapshot(
  db: Db,
  userId: string,
): Promise<CurriculumSnapshot | null> {
  try {
    const { data: units } = await db
      .from("units")
      .select(
        "id, position, title, cefr_level, wida_level, can_do_statement, key_language_use, language_objective, status, skills (id, title, type, position, status, lessons (id, status))",
      )
      .in("status", ["operational", "gated"])
      .order("position", { ascending: true });

    if (!units?.length) return null;

    const { data: mastery } = await db
      .from("skill_mastery")
      .select("skill_id, mastery, attempts")
      .eq("user_id", userId);
    const masteryBy = new Map(
      (mastery ?? []).map((m: Record<string, unknown>) => [m.skill_id as string, m]),
    );

    const isMastered = (skillId: string) => {
      const m = masteryBy.get(skillId) as { mastery?: number; attempts?: number } | undefined;
      return (m?.attempts ?? 0) >= 5 && (m?.mastery ?? 0) >= 0.8;
    };

    // The active unit is the first one with any skill still unmastered.
    const active =
      units.find((u: Record<string, any>) =>
        (u.skills ?? []).some((s: Record<string, any>) => !isMastered(s.id)),
      ) ?? units[units.length - 1];

    const weak = (active.skills ?? [])
      .map((s: Record<string, any>) => ({
        title: s.title as string,
        type: s.type as string,
        mastery: Number((masteryBy.get(s.id) as { mastery?: number } | undefined)?.mastery ?? 0),
      }))
      .sort((a: { mastery: number }, b: { mastery: number }) => a.mastery - b.mastery)
      .slice(0, 3);

    const lessonIds = (active.skills ?? []).flatMap((s: Record<string, any>) =>
      (s.lessons ?? [])
        .filter((l: Record<string, any>) => ["operational", "gated"].includes(l.status))
        .map((l: Record<string, any>) => l.id),
    );

    let targetVocab: string[] = [];
    if (lessonIds.length) {
      const { data: map } = await db
        .from("vocab_lesson_map")
        .select("vocabulary_id")
        .in("lesson_id", lessonIds);
      const ids = [...new Set((map ?? []).map((m: Record<string, any>) => m.vocabulary_id))].slice(0, 40);
      if (ids.length) {
        const { data: vocab } = await db.from("vocabulary").select("lemma").in("id", ids);
        targetVocab = (vocab ?? []).map((v: Record<string, any>) => v.lemma as string);
      }
    }

    const { count } = await db
      .from("vocab_card_state")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due", new Date().toISOString());

    return {
      unit_title: active.title ?? null,
      cefr_level: active.cefr_level ?? null,
      wida_level: active.wida_level ?? null,
      can_do_statement: active.can_do_statement ?? null,
      key_language_use: active.key_language_use ?? null,
      language_objective: active.language_objective ?? null,
      target_vocab: targetVocab,
      weak_skills: weak,
      due_reviews: count ?? 0,
    };
  } catch (error) {
    console.error("curriculum snapshot failed", error);
    return null;
  }
}

/** Render the snapshot as a system-prompt block. */
export function renderCurriculumBlock(snap: CurriculumSnapshot | null): string {
  if (!snap?.unit_title) return "";
  const weak = snap.weak_skills
    .map((s) => `${s.title} (${s.type}, mastery ${Math.round(s.mastery * 100)}%)`)
    .join("; ");
  return `
CURRICULUM CONTEXT (the learner's active coursework — steer the conversation toward it):
Current unit: ${snap.unit_title}${snap.cefr_level ? ` (CEFR ${snap.cefr_level}${snap.wida_level ? `, WIDA ${snap.wida_level}` : ""})` : ""}
Target can-do: ${snap.can_do_statement ?? "n/a"}
Key language use: ${snap.key_language_use ?? "n/a"}
Language objective: ${snap.language_objective ?? "n/a"}
Weakest skills right now: ${weak || "no attempts recorded yet"}
Recycle this unit vocabulary where it fits naturally: ${snap.target_vocab.slice(0, 25).join(", ") || "n/a"}
Prefer role-play and questions that give the learner a chance to perform the can-do above. Do not introduce grammar far beyond this unit.`;
}
