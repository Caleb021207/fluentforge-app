
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface ClassData {
  class_name: string;
  teacher_email?: string;
  teacher_name?: string;
  joined_at: string;
  code: string;
  metrics?: {
    text_practice_calls: number;
    premium_voice_calls: number;
    premium_voice_sessions: number;
    premium_voice_minutes_used: number;
    premium_voice_minutes_remaining: number;
    certification_attempts: number;
    highest_certification_score: number;
    last_activity: string | null;
  };
}

export const useClassData = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setError("No authenticated session");
        setIsLoading(false);
        return;
      }

      // Use the secure view with the corrected column names
      const { data: membershipData, error: membershipError } = await supabase
        .from('teacher_students_secure')
        .select(`
          classroom_id,
          joined_at,
          class_name,
          code,
          teacher_email,
          teacher_name
        `)
        .match({ student_id: session.session.user.id })
        .maybeSingle();

      if (membershipError) {
        console.error('Membership error:', membershipError);
        throw membershipError;
      }
      
      if (!membershipData) {
        setIsLoading(false);
        return;
      }

      // Get metrics using RLS-protected student_metrics table
      const { data: metricsData, error: metricsError } = await supabase
        .from('student_metrics')
        .select(`
          text_practice_calls,
          premium_voice_calls,
          premium_voice_sessions,
          premium_voice_minutes_used,
          premium_voice_minutes_remaining,
          certification_attempts,
          highest_certification_score,
          last_activity
        `)
        .eq('classroom_id', membershipData.classroom_id)
        .eq('student_id', session.session.user.id)
        .maybeSingle();

      if (metricsError) {
        console.error('Metrics error:', metricsError);
        throw metricsError;
      }

      const classInfo: ClassData = {
        class_name: membershipData.class_name,
        teacher_name: membershipData.teacher_name,
        teacher_email: membershipData.teacher_email,
        joined_at: new Date(membershipData.joined_at).toLocaleDateString(),
        code: membershipData.code,
        metrics: metricsData || undefined
      };

      console.log('Fetched class data:', classInfo);
      setClassData(classInfo);
    } catch (error: any) {
      console.error('Error fetching class data:', error);
      setError(error.message);
      toast({
        title: t("error"),
        description: error.message || t("failedToLoadClassData"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('class_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_metrics'
        },
        (payload) => {
          console.log('Metrics updated:', payload);
          fetchClassData();
        }
      )
      .subscribe();

    fetchClassData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { classData, isLoading, error, refetchData: fetchClassData };
};
