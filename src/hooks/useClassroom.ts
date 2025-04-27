
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

interface ClassroomData {
  id: string;
  class_name: string;
  code: string;
  created_at: string;
}

interface StudentUsageMetrics {
  student_id: string;
  student_email: string | null;
  student_name: string | null;
  voice_chat_sessions: number;
  voice_chat_minutes: number;
  certification_attempts: number;
  avg_certification_score: number;
  completed_lessons: number;
  total_lessons: number;
  last_voice_chat: string | null;
  last_certification: string | null;
  last_lesson_progress: string | null;
  class_name?: string;
  classroom_id?: string;
  teacher_id?: string;
}

interface ClassroomResponse {
  success: boolean;
  message: string;
  classroom_id?: string;
  class_code?: string;
  class_name?: string;
}

export function useClassroom() {
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [studentMetrics, setStudentMetrics] = useState<StudentUsageMetrics[]>([]);
  const { toast } = useToast();
  const { t } = useLocalization();

  const checkTeacherStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('is_teacher');
      if (error) {
        console.error('Error checking teacher status:', error);
        return false;
      }
      return data;
    } catch (error) {
      console.error('Error checking teacher status:', error);
      return false;
    }
  }, []);

  const createClassroom = async (className: string) => {
    try {
      const { data, error } = await supabase.rpc('create_classroom', {
        class_name: className
      });

      if (error) {
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      const response = data as { success: boolean; message: string; classroom_id?: string; };
      if (response.success) {
        toast({
          title: t("success"),
          description: response.message
        });
        fetchClassrooms();
        return data;
      }

      toast({
        title: t("error"),
        description: response.message,
        variant: "destructive"
      });
      return null;
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: t("error"),
        description: t("errorCreatingClass"),
        variant: "destructive"
      });
      return null;
    }
  };

  const joinClassroom = async (classCode: string) => {
    try {
      const { data, error } = await supabase.rpc('join_classroom', {
        class_code: classCode
      });

      if (error) {
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      const response = data as { success: boolean; message: string; };
      
      toast({
        title: response.success ? t("success") : t("error"),
        description: response.message,
        variant: response.success ? "default" : "destructive"
      });
      
      return response.success;
    } catch (error) {
      console.error('Error joining classroom:', error);
      toast({
        title: t("error"),
        description: t("errorJoiningClass"),
        variant: "destructive"
      });
      return false;
    }
  };

  const fetchClassrooms = useCallback(async () => {
    if (!isTeacher) return;

    const { data, error } = await supabase
      .from('classroom_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching classrooms:', error);
      return;
    }

    setClassrooms(data);
  }, [isTeacher]);

  const fetchStudentMetrics = useCallback(async () => {
    if (!isTeacher) return;

    const { data, error } = await supabase
      .from('student_usage_metrics')
      .select('*')
      .order('class_name', { ascending: true });

    if (error) {
      console.error('Error fetching student metrics:', error);
      return;
    }

    // Make sure each record has the required fields, even if null
    const processedData = data.map(item => ({
      ...item,
      student_email: item.student_email || null,
      student_name: item.student_name || null
    })) as StudentUsageMetrics[];

    setStudentMetrics(processedData);
  }, [isTeacher]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const teacherStatus = await checkTeacherStatus();
      setIsTeacher(teacherStatus);
      
      if (teacherStatus) {
        await Promise.all([
          fetchClassrooms(),
          fetchStudentMetrics()
        ]);
      }
      
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initialize();
    });

    initialize();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkTeacherStatus, fetchClassrooms, fetchStudentMetrics]);

  return {
    isTeacher,
    isLoading,
    classrooms,
    studentMetrics,
    createClassroom,
    joinClassroom,
    fetchClassrooms,
    fetchStudentMetrics
  };
}
