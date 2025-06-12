
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTeacherStatus = () => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          console.log('No authenticated session found');
          setIsTeacher(false);
          setIsLoading(false);
          return;
        }

        console.log('Checking teacher role for user:', session.session.user.id);
        
        // Since safe_is_teacher doesn't exist, we'll check if user has created any classrooms
        const { data, error } = await supabase
          .from('classroom_codes')
          .select('id')
          .eq('teacher_id', session.session.user.id)
          .limit(1);
        
        if (error) {
          console.error('Error checking teacher status:', error);
          throw error;
        }

        console.log('Teacher role check result:', !!data && data.length > 0);
        setIsTeacher(!!data && data.length > 0);
      } catch (error) {
        console.error('Error checking teacher status:', error);
        setIsTeacher(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherStatus();
  }, []);

  return { isTeacher, isLoading };
};
