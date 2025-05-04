import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/hooks/useLocalization";

interface ClassData {
  class_name: string;
  teacher_email?: string;
  teacher_name?: string;
  joined_at: string;
  code: string;
  metrics?: {
    text_practice_calls: number;
    premium_voice_calls: number;
    last_activity: string | null;
  };
}

export const useClassData = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassData = async () => {
    try {
      console.log("Fetching class data...");
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("No authenticated session found");
        setError("No authenticated session");
        setIsLoading(false);
        return;
      }

      console.log("Authenticated user:", session.session.user.id);

      // Check if student is a member of a classroom
      const { data: membershipData, error: membershipError } = await supabase
        .from('classroom_memberships')
        .select(`
          classroom_id,
          joined_at,
          classroom_codes(id, class_name, code, teacher_id)
        `)
        .eq('student_id', session.session.user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('Membership lookup error:', membershipError);
        throw membershipError;
      }
      
      if (!membershipData) {
        console.log("No classroom membership found for user");
        setClassData(null);
        setIsLoading(false);
        return;
      }

      console.log("Found classroom membership:", membershipData);

      // Get teacher profile if available
      let teacherName = undefined;
      let teacherEmail = undefined;
      
      if (membershipData.classroom_codes?.teacher_id) {
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', membershipData.classroom_codes.teacher_id)
          .maybeSingle();
          
        if (teacherData) {
          teacherName = teacherData.display_name;
          teacherEmail = teacherData.email;
        }
      }

      // Get metrics using RLS-protected student_metrics table
      const { data: metricsData, error: metricsError } = await supabase
        .from('student_metrics')
        .select(`
          text_practice_calls,
          premium_voice_calls,
          last_activity
        `)
        .eq('classroom_id', membershipData.classroom_id)
        .eq('student_id', session.session.user.id)
        .maybeSingle();

      if (metricsError) {
        console.error('Metrics error:', metricsError);
      }

      const classInfo: ClassData = {
        class_name: membershipData.classroom_codes.class_name,
        teacher_name: teacherName,
        teacher_email: teacherEmail,
        joined_at: new Date(membershipData.joined_at).toLocaleDateString(),
        code: membershipData.classroom_codes.code,
        metrics: metricsData || undefined
      };

      console.log('Fetched class data:', classInfo);
      setClassData(classInfo);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching class data:', error);
      setError(error.message || "Failed to load class data");
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
