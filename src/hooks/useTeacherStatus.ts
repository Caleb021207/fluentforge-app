
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
        
        // Using the safe_is_teacher RPC function which is SECURITY DEFINER
        // and therefore doesn't have RLS issues
        const { data, error } = await supabase.rpc('safe_is_teacher');
        
        if (error) {
          console.error('Error checking teacher status:', error);
          throw error;
        }

        console.log('Teacher role check result:', data);
        setIsTeacher(!!data);
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
