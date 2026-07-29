import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Class roster management for teachers.
 *
 * Reads and writes go through the `class-roster` edge function, which verifies
 * the caller actually teaches the class (is_teacher_of_class) before touching
 * enrollments. Student lookup by email needs the service role, so it cannot be
 * done from the browser.
 */

export interface RosterEntry {
  id: string;
  student_id: string;
  status: string | null;
  enrolled_at: string;
  profiles: { display_name: string | null; email: string | null; target_level: string | null } | null;
}

async function callRoster<T>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("class-roster", { body: payload });
  if (error) {
    const message = (data as any)?.error || error.message;
    throw new Error(message);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export function useClassRoster(classId?: string) {
  const queryClient = useQueryClient();
  const [lastError, setLastError] = useState<string | null>(null);

  const rosterQuery = useQuery({
    queryKey: ["class-roster", classId],
    enabled: !!classId,
    queryFn: async () => {
      const res = await callRoster<{ roster: RosterEntry[] }>({ action: "list", classId });
      return res.roster ?? [];
    },
  });

  const addStudent = useMutation({
    mutationFn: (email: string) => callRoster({ action: "add_by_email", classId, email }),
    onSuccess: () => {
      setLastError(null);
      queryClient.invalidateQueries({ queryKey: ["class-roster", classId] });
      queryClient.invalidateQueries({ queryKey: ["class-candos", classId] });
    },
    onError: (e: Error) => setLastError(e.message),
  });

  const removeStudent = useMutation({
    mutationFn: (studentId: string) => callRoster({ action: "remove", classId, studentId }),
    onSuccess: () => {
      setLastError(null);
      queryClient.invalidateQueries({ queryKey: ["class-roster", classId] });
      queryClient.invalidateQueries({ queryKey: ["class-candos", classId] });
    },
    onError: (e: Error) => setLastError(e.message),
  });

  const clearError = useCallback(() => setLastError(null), []);

  return {
    roster: rosterQuery.data ?? [],
    isLoading: rosterQuery.isLoading,
    loadError: rosterQuery.error ? (rosterQuery.error as Error).message : null,
    addStudent,
    removeStudent,
    lastError,
    clearError,
  };
}

/** Classes taught by a teacher. */
export function useTeacherClasses(teacherId?: string) {
  return useQuery({
    queryKey: ["teacher-classes", teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, class_code, period, academic_year, grade_level_id")
        .eq("teacher_id", teacherId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
