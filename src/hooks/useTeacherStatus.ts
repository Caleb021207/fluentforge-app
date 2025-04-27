
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTeacherStatus() {
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkTeacherStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('is_teacher');
      
      if (error) {
        console.error('Error checking teacher status:', error);
        setError(error.message);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('Unexpected error checking teacher status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const teacherStatus = await checkTeacherStatus();
      setIsTeacher(teacherStatus);
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isTeacher,
    isLoading,
    error,
    checkTeacherStatus,
    initialize
  };
}
