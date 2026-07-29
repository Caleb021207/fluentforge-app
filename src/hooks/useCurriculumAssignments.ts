import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Curriculum assignments: a teacher assigns a unit or a lesson from the
 * persistent curriculum to a class (optionally to a named group inside the
 * class), with a due date and a proficiency target used for differentiation.
 *
 * RLS: teachers only touch classes they teach; enrolled students can read.
 */

export interface CurriculumAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  unit_id: string | null;
  lesson_id: string | null;
  title: string;
  instructions: string | null;
  due_date: string | null;
  target_cefr_levels: string[];
  target_wida_min: number | null;
  target_wida_max: number | null;
  group_label: string | null;
  created_at: string;
}

export interface CurriculumAssignmentInput {
  unit_id?: string | null;
  lesson_id?: string | null;
  title: string;
  instructions?: string | null;
  due_date?: string | null;
  target_cefr_levels?: string[];
  target_wida_min?: number | null;
  target_wida_max?: number | null;
  group_label?: string | null;
}

const SELECT = "id, class_id, teacher_id, unit_id, lesson_id, title, instructions, due_date, target_cefr_levels, target_wida_min, target_wida_max, group_label, created_at";

export function useCurriculumAssignments(classId?: string) {
  const queryClient = useQueryClient();
  const key = ["curriculum-assignments", classId];

  const query = useQuery({
    queryKey: key,
    enabled: !!classId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_curriculum_assignments")
        .select(SELECT)
        .eq("class_id", classId!)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as CurriculumAssignment[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: CurriculumAssignmentInput) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in.");
      if (!classId) throw new Error("Pick a class first.");
      if (!input.unit_id && !input.lesson_id) throw new Error("Choose a unit or a lesson.");

      const { data, error } = await supabase
        .from("class_curriculum_assignments")
        .insert({
          class_id: classId,
          teacher_id: auth.user.id,
          unit_id: input.unit_id ?? null,
          lesson_id: input.lesson_id ?? null,
          title: input.title,
          instructions: input.instructions ?? null,
          due_date: input.due_date ?? null,
          target_cefr_levels: input.target_cefr_levels ?? [],
          target_wida_min: input.target_wida_min ?? null,
          target_wida_max: input.target_wida_max ?? null,
          group_label: input.group_label ?? null,
        })
        .select(SELECT)
        .single();
      if (error) throw error;
      return data as CurriculumAssignment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("class_curriculum_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    assignments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    create,
    remove,
  };
}

/** A student's curriculum assignments across every class they are enrolled in. */
export function useStudentCurriculumAssignments() {
  return useQuery({
    queryKey: ["student-curriculum-assignments"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];
      const { data, error } = await supabase
        .from("class_curriculum_assignments")
        .select(`${SELECT}, classes:class_id (name), units:unit_id (title, cefr_level), lessons:lesson_id (title)`)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as (CurriculumAssignment & {
        classes: { name: string } | null;
        units: { title: string; cefr_level: string | null } | null;
        lessons: { title: string } | null;
      })[];
    },
  });
}
