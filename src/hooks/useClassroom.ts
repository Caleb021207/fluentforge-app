
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeacherStatus } from './useTeacherStatus';
import { useClassroomManagement } from './useClassroomManagement';
import { useClassroomData } from './useClassroomData';

export function useClassroom() {
  const { 
    isTeacher, 
    isLoading: isTeacherLoading, 
    error: teacherStatusError,
    initialize: initializeTeacherStatus 
  } = useTeacherStatus();
  
  const { createClassroom, joinClassroom } = useClassroomManagement();
  
  const { 
    classrooms, 
    studentMetrics, 
    fetchClassrooms, 
    fetchStudentMetrics 
  } = useClassroomData();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await initializeTeacherStatus();

        if (isTeacher) {
          await Promise.all([
            fetchClassrooms(true),
            fetchStudentMetrics(true)
          ]);
        }
      } catch (err) {
        console.error('Classroom initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initializeData();
    });

    initializeData();

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeTeacherStatus, isTeacher, fetchClassrooms, fetchStudentMetrics]);

  return {
    isTeacher,
    isLoading: isLoading || isTeacherLoading,
    error: error || teacherStatusError,
    classrooms,
    studentMetrics,
    createClassroom,
    joinClassroom,
    fetchClassrooms,
    fetchStudentMetrics
  };
}
