import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Runs one lesson against the server.
 *
 * The client never sees an answer key: `learn-lesson` returns options without
 * `is_correct`, and `submit-exercise` grades the picked option server-side and
 * returns the verdict plus mastery/XP/streak deltas.
 */

export interface LearnOption {
  id: string;
  label: string;
}

export interface LearnExercise {
  id: string;
  type: string;
  prompt: string;
  difficulty: number | null;
  receptive_productive: string | null;
  options: LearnOption[];
}

export interface LearnLesson {
  id: string;
  title: string;
  intro_md: string | null;
  skill: { id: string; title: string; type: string };
  unit: {
    id: string;
    title: string;
    cefr_level: string | null;
    can_do_statement: string | null;
    content_objective: string | null;
    language_objective: string | null;
  };
}

export interface GradeResult {
  correct: boolean;
  correct_option_id: string;
  explanation: string | null;
  mastery: { mastery: number; ability: number; mastered: boolean; newly_mastered: boolean } | null;
  lesson: { complete: boolean; solved: number; total: number };
  xp_awarded: number;
  xp_reasons: string[];
  streak: { current_streak: number; freeze_used?: boolean } | null;
}

export function useLessonRunner(lessonId?: string) {
  const [lesson, setLesson] = useState<LearnLesson | null>(null);
  const [exercises, setExercises] = useState<LearnExercise[]>([]);
  const [passage, setPassage] = useState<{ title: string | null; body: string } | null>(null);
  const [mastery, setMastery] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    const { data, error: fnError } = await supabase.functions.invoke("learn-lesson", {
      body: { lesson_id: lessonId },
    });
    if (fnError || data?.error) {
      setError(data?.error ?? fnError?.message ?? "Could not load this lesson");
      setLesson(null);
      setExercises([]);
    } else {
      setLesson(data.lesson);
      setExercises(data.exercises ?? []);
      setPassage(data.passage ?? null);
      setMastery(Number(data.mastery ?? 0));
      setError(null);
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(
    async (exerciseId: string, optionId: string | null, responseMs?: number): Promise<GradeResult | null> => {
      const { data, error: fnError } = await supabase.functions.invoke("submit-exercise", {
        body: { exercise_id: exerciseId, option_id: optionId, response_ms: responseMs },
      });
      if (fnError || data?.error) {
        setError(data?.error ?? fnError?.message ?? "Could not submit your answer");
        return null;
      }
      if (data?.mastery) setMastery(Number(data.mastery.mastery));
      return data as GradeResult;
    },
    [],
  );

  return { lesson, exercises, passage, mastery, loading, error, reload: load, submit };
}
