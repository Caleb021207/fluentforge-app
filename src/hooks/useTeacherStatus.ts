
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTeacherStatus() {
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkTeacherStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('is_teacher');
      if (error) {
        console.error('Error checking teacher status:', error);
        return false;
      }
      return data;
    } catch (error) {
      console.error('Error checking teacher status:', error);
      return false;
    }
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    const teacherStatus = await checkTeacherStatus();
    setIsTeacher(teacherStatus);
    setIsLoading(false);
  };

  return {
    isTeacher,
    isLoading,
    checkTeacherStatus,
    initialize
  };
}
