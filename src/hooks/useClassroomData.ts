
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ClassroomData, StudentUsageMetrics } from '@/types/classroom';

export function useClassroomData() {
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [studentMetrics, setStudentMetrics] = useState<StudentUsageMetrics[]>([]);

  const fetchClassrooms = useCallback(async (isTeacher: boolean) => {
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
  }, []);

  const fetchStudentMetrics = useCallback(async (isTeacher: boolean) => {
    if (!isTeacher) return;

    const { data, error } = await supabase
      .from('student_usage_metrics')
      .select('*')
      .order('class_name', { ascending: true });

    if (error) {
      console.error('Error fetching student metrics:', error);
      return;
    }

    const processedData = data.map(item => ({
      ...item,
      student_id: item.student_id || '',
      student_email: null,
      student_name: null,
      voice_chat_sessions: item.voice_chat_sessions || 0,
      voice_chat_minutes: item.voice_chat_minutes || 0,
      certification_attempts: item.certification_attempts || 0,
      avg_certification_score: item.avg_certification_score || 0,
      completed_lessons: item.completed_lessons || 0,
      total_lessons: item.total_lessons || 0,
      last_voice_chat: item.last_voice_chat || null,
      last_certification: item.last_certification || null,
      last_lesson_progress: item.last_lesson_progress || null,
    })) as StudentUsageMetrics[];

    setStudentMetrics(processedData);
  }, []);

  return {
    classrooms,
    studentMetrics,
    fetchClassrooms,
    fetchStudentMetrics
  };
}
