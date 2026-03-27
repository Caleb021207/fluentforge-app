import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  topic_prompt: string | null;
  cefr_level: string | null;
  min_messages: number;
  assignment_mode: string;
  max_duration_minutes: number;
  grammar_requirements: any;
  due_date: string | null;
  points_possible: number;
  class_id: string;
  class_name?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: string;
  score: number | null;
  teacher_override_score: number | null;
  teacher_notes: string | null;
  message_count: number;
  messages: any;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}
}

export interface AssignmentWithSubmission extends Assignment {
  submission?: AssignmentSubmission;
}

export const useStudentAssignments = () => {
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAssignments([]);
        return;
      }

      // Get student's enrolled classes
      const { data: enrollments, error: enrollError } = await supabase
        .from('student_enrollments')
        .select('class_id, classes(name)')
        .eq('student_id', user.id);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setAssignments([]);
        return;
      }

      const classIds = enrollments.map(e => e.class_id).filter(Boolean);

      // Get assignments for enrolled classes
      const { data: assignmentsData, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .in('class_id', classIds)
        .not('topic_prompt', 'is', null) // Only conversation assignments
        .order('due_date', { ascending: true });

      if (assignError) throw assignError;

      // Get submissions for these assignments
      const { data: submissions, error: subError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (subError) throw subError;

      // Merge assignments with submissions and class names
      const merged: AssignmentWithSubmission[] = (assignmentsData || []).map(assignment => {
        const enrollment = enrollments.find(e => e.class_id === assignment.class_id);
        const submission = submissions?.find(s => s.assignment_id === assignment.id);
        return {
          ...assignment,
          class_name: (enrollment?.classes as any)?.name || 'Unknown Class',
          submission: submission as AssignmentSubmission | undefined
        };
      });

      setAssignments(merged);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // acceptAssignment removed - submissions are now auto-created by teachers

  const startAssignment = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      await fetchAssignments();
    } catch (err: any) {
      console.error('Error starting assignment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Count assignments that are assigned to this student (have a submission) and not completed
  const pendingCount = assignments.filter(a => 
    a.submission && (a.submission.status === 'pending' || a.submission.status === 'in_progress')
  ).length;

  return {
    assignments,
    isLoading,
    error,
    pendingCount,
    fetchAssignments,
    startAssignment
  };
};
