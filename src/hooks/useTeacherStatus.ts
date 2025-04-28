
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
          return;
        }

        console.log('Checking teacher status for user:', session.session.user.id);
        
        // Check if current user has teacher role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.session.user.id)
          .eq('role', 'teacher')
          .maybeSingle();
        
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
