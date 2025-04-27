
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTeacherStatus = () => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_teacher');
        if (error) throw error;
        setIsTeacher(!!data);
      } catch (error) {
        console.error('Error checking teacher status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherStatus();
  }, []);

  return { isTeacher, isLoading };
};
