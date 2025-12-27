import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeacherAssignment {
  id: string;
  title: string;
  description: string | null;
  topic_prompt: string | null;
  cefr_level: string | null;
  min_messages: number;
  assignment_mode: string;
  max_duration_minutes: number;
  grammar_requirements: string[] | null;
  due_date: string | null;
  points_possible: number;
  class_id: string;
  created_at: string;
}

export interface StudentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: string;
  ai_score: number | null;
  ai_feedback: unknown;
  xp_awarded: number;
  message_count: number;
  completed_at: string | null;
  transcript: unknown;
  student_name?: string;
}

export const useTeacherAssignments = (classId?: string) => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!classId) return;
    
    try {
      setIsLoading(true);

      const { data: assignmentsData, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .not('topic_prompt', 'is', null)
        .order('created_at', { ascending: false });

      if (assignError) throw assignError;

      setAssignments(assignmentsData || []);

      // Fetch submissions for these assignments
      if (assignmentsData && assignmentsData.length > 0) {
        const assignmentIds = assignmentsData.map(a => a.id);
        const { data: submissionsData, error: subError } = await supabase
          .from('assignment_submissions')
          .select('*')
          .in('assignment_id', assignmentIds);

        if (subError) throw subError;

        setSubmissions(submissionsData || []);
      }
    } catch (err: any) {
      console.error('Error fetching teacher assignments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  const createAssignment = async (assignmentData: {
    title: string;
    description?: string;
    topic_prompt: string;
    cefr_level: string;
    min_messages: number;
    max_duration_minutes: number;
    grammar_requirements?: string[];
    due_date?: string;
    points_possible?: number;
    assignment_mode?: string;
  }) => {
    if (!classId) throw new Error('No class ID provided');

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        ...assignmentData,
        class_id: classId,
        assignment_type: 'conversation'
      })
      .select()
      .single();

    if (error) throw error;

    await fetchAssignments();
    return data;
  };

  const deleteAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
    await fetchAssignments();
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    submissions,
    isLoading,
    error,
    createAssignment,
    deleteAssignment,
    fetchAssignments
  };
};
