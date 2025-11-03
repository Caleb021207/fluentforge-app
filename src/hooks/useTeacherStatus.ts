
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTeacherStatus = () => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          console.log('No authenticated session found');
          setIsTeacher(false);
          setTeacherId(null);
          setIsLoading(false);
          return;
        }

        console.log('Checking teacher role for user:', session.session.user.id);
        
        // Check if user has teacher role in user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', session.session.user.id)
          .eq('role', 'teacher')
          .limit(1);
        
        if (error) {
          console.error('Error checking teacher status:', error);
          throw error;
        }

        const hasTeacherRole = !!data && data.length > 0;
        console.log('Teacher role check result:', hasTeacherRole);
        setIsTeacher(hasTeacherRole);
        setTeacherId(hasTeacherRole ? session.session.user.id : null);
      } catch (error) {
        console.error('Error checking teacher status:', error);
        setIsTeacher(false);
        setTeacherId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherStatus();
  }, []);

  return { isTeacher, teacherId, isLoading };
};
