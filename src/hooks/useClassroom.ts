
import { useEffect, useState } from 'react';
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
  student_email: string;
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
}

export function useClassroom() {
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [studentMetrics, setStudentMetrics] = useState<StudentUsageMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLocalization();

  const checkTeacherStatus = async () => {
    const { data, error } = await supabase.rpc('is_teacher');
    if (error) {
      console.error('Error checking teacher status:', error);
      return false;
    }
    return data;
  };

  const createClassroom = async (className: string) => {
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

    if (data.success) {
      toast({
        title: t("success"),
        description: data.message
      });
      fetchClassrooms();
      return data;
    }

    return null;
  };

  const joinClassroom = async (classCode: string) => {
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

    if (data.success) {
      toast({
        title: t("success"),
        description: data.message
      });
      return true;
    }

    toast({
      title: t("error"),
      description: data.message,
      variant: "destructive"
    });
    return false;
  };

  const fetchClassrooms = async () => {
    const { data, error } = await supabase
      .from('classroom_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching classrooms:', error);
      return;
    }

    setClassrooms(data);
  };

  const fetchStudentMetrics = async () => {
    const { data, error } = await supabase
      .from('student_usage_metrics')
      .select('*')
      .order('class_name', { ascending: true });

    if (error) {
      console.error('Error fetching student metrics:', error);
      return;
    }

    setStudentMetrics(data);
  };

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

    initialize();
  }, []);

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
