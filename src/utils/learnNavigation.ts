/**
 * Pure navigation helpers for the learner path (/learn).
 *
 * Structural types mirror `PathUnit` from `useLearningPath` without importing
 * the hook, so tests never pull in the Supabase client.
 */

export interface NavLesson {
  id: string;
  title: string;
  progress?: { status?: string | null; completed_at?: string | null } | null;
}

export interface NavSkill {
  lessons: NavLesson[];
}

export interface NavUnit {
  id: string;
  unlocked: boolean;
  skills: NavSkill[];
}

export interface NextLessonRef {
  unitId: string;
  lessonId: string;
  title: string;
}

/** A lesson counts as done when server progress marks it completed. */
export const isLessonDone = (lesson: NavLesson): boolean =>
  lesson.progress?.status === "completed" || Boolean(lesson.progress?.completed_at);

/**
 * First lesson without completed server progress, walking unlocked units in
 * path order. Searches across unit boundaries so "Continue" still points at
 * real remaining work when the current unit's lessons are all done but its
 * mastery is below 100%.
 */
export function findNextLesson(units: readonly NavUnit[]): NextLessonRef | null {
  for (const unit of units) {
    if (!unit.unlocked) continue;
    for (const skill of unit.skills) {
      for (const lesson of skill.lessons) {
        if (!isLessonDone(lesson)) {
          return { unitId: unit.id, lessonId: lesson.id, title: lesson.title };
        }
      }
    }
  }
  return null;
}

/** DOM anchor id for a unit card on /learn (used by hash deep-links). */
export const unitAnchorId = (unitId: string): string => `unit-${unitId}`;
