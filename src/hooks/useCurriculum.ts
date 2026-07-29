import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CurriculumExerciseOption {
  id: string;
  label: string;
  is_correct: boolean;
  position: number;
  rationale: string | null;
}

export interface CurriculumExercise {
  id: string;
  lesson_id: string;
  position: number;
  type: string;
  prompt: string;
  difficulty: number | null;
  receptive_productive: string | null;
  status: string;
  source_model: string | null;
  gate_results: any;
  exercise_options?: CurriculumExerciseOption[];
}

export interface CurriculumLesson {
  id: string;
  title: string;
  position: number;
  intro_md: string | null;
  status: string;
}

export interface CurriculumSkill {
  id: string;
  title: string;
  type: string;
  position: number;
  target_grammar_point: string | null;
  status: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumUnit {
  id: string;
  title: string;
  position: number;
  theme: string | null;
  cefr_level: string | null;
  wida_level: number | null;
  can_do_statement: string | null;
  key_language_use: string | null;
  content_objective: string | null;
  language_objective: string | null;
  status: string;
  skills: CurriculumSkill[];
}

export interface CurriculumCourse {
  id: string;
  title: string;
  description: string | null;
  level_band: string | null;
  target_framework: string;
  status: string;
  units: CurriculumUnit[];
}

function sortByPosition<T extends { position: number }>(rows: T[] | null | undefined): T[] {
  return [...(rows ?? [])].sort((a, b) => a.position - b.position);
}

/** Loads the whole curriculum tree. Admin RLS lets this include draft content. */
export function useCurriculum() {
  const [courses, setCourses] = useState<CurriculumCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select(
        "id, title, description, level_band, target_framework, status, units (id, title, position, theme, cefr_level, wida_level, can_do_statement, key_language_use, content_objective, language_objective, status, skills (id, title, type, position, target_grammar_point, status, lessons (id, title, position, intro_md, status)))",
      )
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setCourses([]);
    } else {
      setError(null);
      setCourses(
        (data ?? []).map((c: any) => ({
          ...c,
          units: sortByPosition(c.units).map((u: any) => ({
            ...u,
            skills: sortByPosition(u.skills).map((s: any) => ({
              ...s,
              lessons: sortByPosition(s.lessons),
            })),
          })),
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { courses, loading, error, reload: load };
}

/** Loads exercises for one lesson, including the admin-only answer key. */
export function useLessonExercises(lessonId: string | null) {
  const [exercises, setExercises] = useState<CurriculumExercise[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId) {
      setExercises([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("exercises")
      .select("id, lesson_id, position, type, prompt, difficulty, receptive_productive, status, source_model, gate_results, exercise_options (id, label, is_correct, position, rationale)")
      .eq("lesson_id", lessonId)
      .order("position", { ascending: true });

    if (error) console.error("Failed to load exercises:", error.message);
    setExercises(
      ((data ?? []) as any[]).map((e) => ({
        ...e,
        exercise_options: sortByPosition(e.exercise_options),
      })),
    );
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = useCallback(
    async (exerciseId: string, status: "operational" | "retired" | "gated" | "draft") => {
      const { error } = await supabase.from("exercises").update({ status }).eq("id", exerciseId);
      if (error) throw new Error(error.message);
      setExercises((prev) => prev.map((e) => (e.id === exerciseId ? { ...e, status } : e)));
    },
    [],
  );

  const updatePrompt = useCallback(async (exerciseId: string, prompt: string) => {
    const { error } = await supabase.from("exercises").update({ prompt }).eq("id", exerciseId);
    if (error) throw new Error(error.message);
    setExercises((prev) => prev.map((e) => (e.id === exerciseId ? { ...e, prompt } : e)));
  }, []);

  return { exercises, loading, reload: load, setStatus, updatePrompt };
}
