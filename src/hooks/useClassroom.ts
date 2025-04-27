
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeacherStatus } from './useTeacherStatus';
import { useClassroomManagement } from './useClassroomManagement';
import { useClassroomData } from './useClassroomData';

export function useClassroom() {
  const { isTeacher, isLoading, initialize } = useTeacherStatus();
  const { createClassroom, joinClassroom } = useClassroomManagement();
  const { 
    classrooms, 
    studentMetrics, 
    fetchClassrooms, 
    fetchStudentMetrics 
  } = useClassroomData();

  useEffect(() => {
    const initializeData = async () => {
      await initialize();
      
      if (isTeacher) {
        await Promise.all([
          fetchClassrooms(true),
          fetchStudentMetrics(true)
        ]);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initializeData();
    });

    initializeData();

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, isTeacher, fetchClassrooms, fetchStudentMetrics]);

  return {
    isTeacher,
    isLoading,
    classrooms,
    studentMetrics,
    createClassroom,
    joinClassroom,
    fetchClassrooms,
    fetchStudentMetrics
  };
}
