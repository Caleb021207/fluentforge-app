import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * The learner-facing curriculum tree.
 *
 * Structure comes straight from the database (RLS only exposes published
 * content); progress and mastery come from the server-written progress tables.
 * Unit progression is gated: a unit unlocks when the previous unit's skills
 * are mastered.
 */

export const MASTERY_THRESHOLD = 0.8;
export const MASTERY_MIN_ATTEMPTS = 5;

export interface PathLesson {
  id: string;
  title: string;
  position: number;
  status: string;
  progress?: { status: string; accuracy: number; completed_at: string | null } | null;
}

export interface PathSkill {
  id: string;
  title: string;
  type: string;
  position: number;
  lessons: PathLesson[];
  mastery: number;
  attempts: number;
  mastered: boolean;
}

export interface PathUnit {
  id: string;
  title: string;
  position: number;
  theme: string | null;
  cefr_level: string | null;
  can_do_statement: string | null;
  skills: PathSkill[];
  unlocked: boolean;
  progressPct: number;
}

const byPosition = <T extends { position: number }>(rows: T[] | null | undefined) =>
  [...(rows ?? [])].sort((a, b) => a.position - b.position);

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** true when `level` is at or below `ceiling` on the CEFR scale */
const cefrAtOrBelow = (level: string | null, ceiling: string | null): boolean => {
  if (!level || !ceiling) return false;
  const li = CEFR_ORDER.indexOf(level.toUpperCase());
  const ci = CEFR_ORDER.indexOf(ceiling.toUpperCase());
  return li >= 0 && ci >= 0 && li <= ci;
};

const isOperational = (row: any) => row?.status === "operational";

export function useLearningPath() {
  const [units, setUnits] = useState<PathUnit[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [dueReviews, setDueReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      const [{ data: courses, error: courseErr }, mastery, progress, cards, profileRes] = await Promise.all([
        supabase
          .from("courses")
          .select(
            "id, title, status, units (id, title, position, theme, cefr_level, can_do_statement, status, skills (id, title, type, position, status, lessons (id, title, position, status)))",
          )
          .eq("status", "operational")
          .order("created_at", { ascending: true }),
        userId
          ? supabase.from("skill_mastery").select("skill_id, mastery, attempts").eq("user_id", userId)
          : Promise.resolve({ data: [] as any[] }),
        userId
          ? supabase
              .from("lesson_progress")
              .select("lesson_id, status, accuracy, completed_at")
              .eq("user_id", userId)
          : Promise.resolve({ data: [] as any[] }),
        userId
          ? supabase
              .from("vocab_card_state")
              .select("id", { count: "exact", head: true })
              .eq("user_id", userId)
              .lte("due", new Date().toISOString())
          : Promise.resolve({ count: 0 }),
        userId
          ? supabase.from("profiles").select("placement_cefr").eq("id", userId).maybeSingle()
          : Promise.resolve({ data: null as { placement_cefr: string | null } | null }),
      ]);

      if (courseErr) throw courseErr;

      setDueReviews((cards as { count?: number }).count ?? 0);

      const masteryBy = new Map(
        ((mastery as { data?: any[] }).data ?? []).map((m) => [m.skill_id as string, m]),
      );
      const progressBy = new Map(
        ((progress as { data?: any[] }).data ?? []).map((p) => [p.lesson_id as string, p]),
      );

      const course = (courses ?? [])[0] as any;
      setCourseTitle(course?.title ?? "");

      const placementCefr =
        (profileRes as { data?: { placement_cefr: string | null } | null }).data?.placement_cefr ?? null;

      let previousCleared = true;
      const operationalUnits = byPosition(course?.units ?? []).filter(isOperational);
      const mapped: PathUnit[] = operationalUnits.map((u: any) => {
        const skills: PathSkill[] = byPosition((u.skills ?? []).filter(isOperational)).map((s: any) => {
          const m = masteryBy.get(s.id);
          const attempts = m?.attempts ?? 0;
          const value = Number(m?.mastery ?? 0);
          return {
            id: s.id,
            title: s.title,
            type: s.type,
            position: s.position,
            mastery: value,
            attempts,
            mastered: attempts >= MASTERY_MIN_ATTEMPTS && value >= MASTERY_THRESHOLD,
            lessons: byPosition((s.lessons ?? []).filter(isOperational)).map((l: any) => ({
              id: l.id,
              title: l.title,
              position: l.position,
              status: l.status,
              progress: progressBy.get(l.id) ?? null,
            })),
          };
        });

        // A unit is unlocked when any of these hold:
        //  - it's next in sequence (previous unit cleared),
        //  - the placement quiz put the learner at/above this unit's level.
        const unlocked = previousCleared || cefrAtOrBelow(u.cefr_level, placementCefr);

        // "Cleared" = every skill mastered, OR every lesson completed. The
        // completion route lets a learner who finished all lessons move on
        // even if one skill's mastery score is still below threshold.
        const allSkillsMastered = skills.length > 0 && skills.every((s) => s.mastered);
        const allLessonsDone =
          skills.length > 0 &&
          skills.every(
            (s) =>
              s.lessons.length > 0 &&
              s.lessons.every((l) => l.progress?.status === "completed" || l.progress?.completed_at),
          );
        previousCleared = allSkillsMastered || allLessonsDone;

        const progressPct = skills.length
          ? Math.round((skills.reduce((sum, s) => sum + Math.min(1, s.mastery), 0) / skills.length) * 100)
          : 0;

        return {
          id: u.id,
          title: u.title,
          position: u.position,
          theme: u.theme,
          cefr_level: u.cefr_level,
          can_do_statement: u.can_do_statement,
          skills,
          unlocked,
          progressPct,
        };
      });

      setUnits(mapped);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { units, courseTitle, dueReviews, loading, error, reload: load };
}
