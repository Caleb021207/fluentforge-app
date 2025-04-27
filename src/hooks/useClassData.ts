
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
    voice_chat_sessions: number;
    voice_chat_minutes: number;
    text_inputs: number;
    text_outputs: number;
    premium_voice_sessions: number;
    premium_voice_minutes: number;
    certification_attempts: number;
    highest_certification_score: number;
    completed_lessons: number;
    total_lessons: number;
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

      const { data: membershipData, error: membershipError } = await supabase
        .from('classroom_memberships')
        .select(`
          classroom_id,
          joined_at,
          classroom:classroom_codes!inner (
            class_name,
            code,
            teacher_id
          )
        `)
        .maybeSingle();

      if (membershipError) {
        console.error('Membership error:', membershipError);
        throw membershipError;
      }
      
      if (!membershipData) {
        setIsLoading(false);
        return;
      }

      let teacherName = undefined;
      let teacherEmail = undefined;

      if (membershipData.classroom.teacher_id) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('email, display_name')
          .eq('id', membershipData.classroom.teacher_id)
          .maybeSingle();

        if (teacherError) {
          console.error('Teacher data error:', teacherError);
        }

        if (teacherData) {
          teacherEmail = teacherData.email;
          teacherName = teacherData.display_name;
        }
      }

      // Try to trigger a recalculation of metrics
      try {
        const { error: recalcError } = await supabase.rpc(
          'recalculate_student_metrics',
          { target_student_id: session.session.user.id }
        );
        
        if (recalcError) {
          console.error('Error recalculating metrics:', recalcError);
        }
      } catch (e) {
        console.error('Failed to recalculate metrics:', e);
      }

      // Get student metrics from the class_student_metrics view with more detailed error logging
      const { data: metricsData, error: metricsError } = await supabase
        .from('class_student_metrics')
        .select('*')
        .eq('classroom_id', membershipData.classroom_id)
        .eq('student_id', session.session.user.id)
        .maybeSingle();

      if (metricsError) {
        console.error('Metrics error:', metricsError);
        throw metricsError;
      }

      const classInfo: ClassData = {
        class_name: membershipData.classroom.class_name,
        teacher_email: teacherEmail,
        teacher_name: teacherName,
        joined_at: new Date(membershipData.joined_at).toLocaleDateString(),
        code: membershipData.classroom.code,
        metrics: metricsData || undefined
      };

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
    // Enable realtime updates for the metrics table
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

    // Initial fetch
    fetchClassData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { classData, isLoading, error, refetchData: fetchClassData };
};
