
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface ClassData {
  name: string;
  teacher_email?: string;
  teacher_name?: string;
  enrolled_at: string;
  class_code: string;
  metrics?: {
    text_practice_calls: number;
    premium_voice_calls: number;
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
      console.log("Fetching class data...");
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("No authenticated session found");
        setError("No authenticated session");
        setIsLoading(false);
        return;
      }

      console.log("Authenticated user:", session.session.user.id);

      // Check if student is enrolled in a class
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .select(`
          class_id,
          enrollment_date
        `)
        .eq('student_id', session.session.user.id)
        .maybeSingle();

      if (enrollmentError) {
        console.error('Enrollment lookup error:', enrollmentError);
        throw enrollmentError;
      }
      
      if (!enrollmentData) {
        console.log("No class enrollment found for user");
        setClassData(null);
        setIsLoading(false);
        return;
      }

      console.log("Found class enrollment:", enrollmentData);

      // Get class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          class_code,
          teacher_id
        `)
        .eq('id', enrollmentData.class_id)
        .maybeSingle();

      if (classError) {
        console.error('Class lookup error:', classError);
        throw classError;
      }

      if (!classData) {
        console.log("No class found for enrollment");
        setClassData(null);
        setIsLoading(false);
        return;
      }

      // Get teacher profile if available
      let teacherName = undefined;
      let teacherEmail = undefined;
      
      if (classData.teacher_id) {
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', classData.teacher_id)
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
        .eq('student_id', session.session.user.id)
        .maybeSingle();

      if (metricsError) {
        console.error('Metrics error:', metricsError);
      }

      const classInfo: ClassData = {
        name: classData.name,
        teacher_name: teacherName,
        teacher_email: teacherEmail,
        enrolled_at: new Date(enrollmentData.enrollment_date).toLocaleDateString(),
        class_code: classData.class_code,
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
