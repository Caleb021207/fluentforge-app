import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Client-side teacher check for UI gating. A user is a teacher when their
 * profile role says so (set during onboarding) or they own at least one class.
 * Server-side enforcement lives in RLS (is_teacher_of_class /
 * is_teacher_of_student) — this hook only decides what UI to show.
 */
export const useTeacherStatus = () => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkTeacherStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;

        if (!userId) {
          if (active) {
            setIsTeacher(false);
            setTeacherId(null);
          }
          return;
        }

        const [profileRes, classRes] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
          supabase.from('classes').select('id').eq('teacher_id', userId).limit(1),
        ]);

        const roleIsTeacher = profileRes.data?.role === 'teacher';
        const ownsClass = (classRes.data?.length ?? 0) > 0;
        const teacher = roleIsTeacher || ownsClass;

        if (active) {
          setIsTeacher(teacher);
          setTeacherId(teacher ? userId : null);
        }
      } catch (error) {
        console.error('Error checking teacher status:', error);
        if (active) {
          setIsTeacher(false);
          setTeacherId(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    checkTeacherStatus();
    return () => {
      active = false;
    };
  }, []);

  return { isTeacher, teacherId, isLoading };
};
