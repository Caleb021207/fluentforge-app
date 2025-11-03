import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClassMetricsData {
  scoreProgression: Array<{ date: string; avgScore: number; count: number }>;
  grammarTrends: Array<{ date: string; avgGrammar: number; count: number }>;
  complexityTrends: Array<{ date: string; avgComplexity: number; count: number }>;
  pronunciationTrends: Array<{ date: string; avgPronunciation: number; count: number }>;
  totalStudents: number;
  totalClasses: number;
}

export const useTeacherClassMetrics = (teacherId: string | undefined) => {
  return useQuery({
    queryKey: ['teacher-class-metrics', teacherId],
    queryFn: async (): Promise<ClassMetricsData> => {
      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }

      // Fetch teacher's classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacherId);

      if (classesError) throw classesError;
      if (!classes || classes.length === 0) {
        return {
          scoreProgression: [],
          grammarTrends: [],
          complexityTrends: [],
          pronunciationTrends: [],
          totalStudents: 0,
          totalClasses: 0,
        };
      }

      const classIds = classes.map(c => c.id);

      // Fetch all student enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .in('class_id', classIds);

      if (enrollmentsError) throw enrollmentsError;

      const studentIds = [...new Set(enrollments?.map(e => e.student_id) || [])];

      if (studentIds.length === 0) {
        return {
          scoreProgression: [],
          grammarTrends: [],
          complexityTrends: [],
          pronunciationTrends: [],
          totalStudents: 0,
          totalClasses: classes.length,
        };
      }

      // Fetch test scores from transcript analyses
      const { data: certAttempts, error: certError } = await supabase
        .from('transcript_analyses')
        .select('user_id, overall_score, upload_date')
        .in('user_id', studentIds)
        .not('overall_score', 'is', null)
        .order('upload_date', { ascending: true });

      if (certError) throw certError;

      // Fetch language metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('student_language_metrics')
        .select('user_id, grammar_accuracy, conversation_complexity, pronunciation_accuracy, created_at')
        .in('user_id', studentIds)
        .order('created_at', { ascending: true });

      if (metricsError) throw metricsError;

      // Aggregate score progression by date
      const scoreByDate = new Map<string, { total: number; count: number }>();
      certAttempts?.forEach(attempt => {
        if (attempt.upload_date) {
          const date = new Date(attempt.upload_date).toLocaleDateString();
          const existing = scoreByDate.get(date) || { total: 0, count: 0 };
          scoreByDate.set(date, {
            total: existing.total + Number(attempt.overall_score),
            count: existing.count + 1,
          });
        }
      });

      const scoreProgression = Array.from(scoreByDate.entries()).map(([date, data]) => ({
        date,
        avgScore: Number((data.total / data.count).toFixed(1)),
        count: data.count,
      }));

      // Aggregate grammar trends by date
      const grammarByDate = new Map<string, { total: number; count: number }>();
      metrics?.forEach(metric => {
        if (metric.grammar_accuracy != null) {
          const date = new Date(metric.created_at).toLocaleDateString();
          const existing = grammarByDate.get(date) || { total: 0, count: 0 };
          grammarByDate.set(date, {
            total: existing.total + Number(metric.grammar_accuracy),
            count: existing.count + 1,
          });
        }
      });

      const grammarTrends = Array.from(grammarByDate.entries()).map(([date, data]) => ({
        date,
        avgGrammar: Number((data.total / data.count).toFixed(1)),
        count: data.count,
      }));

      // Aggregate complexity trends by date
      const complexityByDate = new Map<string, { total: number; count: number }>();
      metrics?.forEach(metric => {
        if (metric.conversation_complexity != null) {
          const date = new Date(metric.created_at).toLocaleDateString();
          const existing = complexityByDate.get(date) || { total: 0, count: 0 };
          complexityByDate.set(date, {
            total: existing.total + Number(metric.conversation_complexity),
            count: existing.count + 1,
          });
        }
      });

      const complexityTrends = Array.from(complexityByDate.entries()).map(([date, data]) => ({
        date,
        avgComplexity: Number((data.total / data.count).toFixed(1)),
        count: data.count,
      }));

      // Aggregate pronunciation trends by date
      const pronunciationByDate = new Map<string, { total: number; count: number }>();
      metrics?.forEach(metric => {
        if (metric.pronunciation_accuracy != null) {
          const date = new Date(metric.created_at).toLocaleDateString();
          const existing = pronunciationByDate.get(date) || { total: 0, count: 0 };
          pronunciationByDate.set(date, {
            total: existing.total + Number(metric.pronunciation_accuracy),
            count: existing.count + 1,
          });
        }
      });

      const pronunciationTrends = Array.from(pronunciationByDate.entries()).map(([date, data]) => ({
        date,
        avgPronunciation: Number((data.total / data.count).toFixed(1)),
        count: data.count,
      }));

      return {
        scoreProgression,
        grammarTrends,
        complexityTrends,
        pronunciationTrends,
        totalStudents: studentIds.length,
        totalClasses: classes.length,
      };
    },
    enabled: !!teacherId,
  });
};
