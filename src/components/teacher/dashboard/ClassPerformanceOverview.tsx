import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  CheckCircle, 
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ClassScoreProgressionChart from '../ClassScoreProgressionChart';
import ClassGrammarAccuracyChart from '../ClassGrammarAccuracyChart';
import ClassConversationComplexityChart from '../ClassConversationComplexityChart';
import ClassPronunciationAccuracyChart from '../ClassPronunciationAccuracyChart';

interface ClassPerformanceOverviewProps {
  teacherId: string | undefined;
}

const ClassPerformanceOverview = ({ teacherId }: ClassPerformanceOverviewProps) => {
  const { t } = useLocalization();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacher-dashboard-stats', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;

      // Get classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacherId);

      const classIds = classes?.map(c => c.id) || [];
      
      if (classIds.length === 0) {
        return {
          totalStudents: 0,
          totalClasses: 0,
          completedAssignments: 0,
          averageGrade: 0,
          totalXPEarned: 0,
          studentsNeedingAttention: 0,
          topPerformers: [],
          recentActivity: []
        };
      }

      // Get enrollments
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .in('class_id', classIds);

      const studentIds = [...new Set(enrollments?.map(e => e.student_id) || [])];

      // Get assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .in('class_id', classIds);

      const assignmentIds = assignments?.map(a => a.id) || [];

      // Get submissions
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id, score, status, student_id')
        .in('assignment_id', assignmentIds);

      const completedSubmissions = submissions?.filter(s => s.status === 'completed') || [];
      const avgGrade = completedSubmissions.length > 0
        ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions.length
        : 0;

      // Get student metrics for XP and activity
      const { data: metrics } = await supabase
        .from('student_metrics')
        .select('student_id, last_activity')
        .in('student_id', studentIds);

      // Identify students needing attention (no activity in 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const studentsNeedingAttention = metrics?.filter(m => 
        !m.last_activity || new Date(m.last_activity) < sevenDaysAgo
      ).length || 0;

      // Get top performers by completed assignments
      const studentSubmissionCounts = new Map<string, number>();
      completedSubmissions.forEach(s => {
        studentSubmissionCounts.set(
          s.student_id,
          (studentSubmissionCounts.get(s.student_id) || 0) + 1
        );
      });

      const topPerformerIds = Array.from(studentSubmissionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const { data: topProfiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', topPerformerIds);

      return {
        totalStudents: studentIds.length,
        totalClasses: classIds.length,
        completedAssignments: completedSubmissions.length,
        averageGrade: Math.round(avgGrade),
        totalXPEarned: 0,
        studentsNeedingAttention,
        topPerformers: topProfiles || []
      };
    },
    enabled: !!teacherId,
  });

  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ['teacher-chart-data', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;

      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacherId);

      const classIds = classes?.map(c => c.id) || [];
      
      if (classIds.length === 0) {
        return {
          scoreProgression: [],
          grammarTrends: [],
          complexityTrends: [],
          pronunciationTrends: []
        };
      }

      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .in('class_id', classIds);

      const studentIds = [...new Set(enrollments?.map(e => e.student_id) || [])];

      if (studentIds.length === 0) {
        return {
          scoreProgression: [],
          grammarTrends: [],
          complexityTrends: [],
          pronunciationTrends: []
        };
      }

      // Get transcript analyses for score progression
      const { data: analyses } = await supabase
        .from('transcript_analyses')
        .select('overall_score, upload_date')
        .in('user_id', studentIds)
        .not('overall_score', 'is', null)
        .order('upload_date', { ascending: true });

      // Get language metrics
      const { data: langMetrics } = await supabase
        .from('student_language_metrics')
        .select('grammar_accuracy, conversation_complexity, pronunciation_accuracy, created_at')
        .in('user_id', studentIds)
        .order('created_at', { ascending: true });

      // Aggregate by date
      const aggregateByDate = (items: any[], valueKey: string, dateKey: string) => {
        const byDate = new Map<string, { total: number; count: number }>();
        items?.forEach(item => {
          if (item[valueKey] != null && item[dateKey]) {
            const date = new Date(item[dateKey]).toLocaleDateString();
            const existing = byDate.get(date) || { total: 0, count: 0 };
            byDate.set(date, {
              total: existing.total + Number(item[valueKey]),
              count: existing.count + 1
            });
          }
        });
        return Array.from(byDate.entries()).map(([date, data]) => ({
          date,
          value: Number((data.total / data.count).toFixed(1)),
          count: data.count
        }));
      };

      return {
        scoreProgression: aggregateByDate(analyses || [], 'overall_score', 'upload_date').map(d => ({
          date: d.date,
          avgScore: d.value,
          count: d.count
        })),
        grammarTrends: aggregateByDate(langMetrics || [], 'grammar_accuracy', 'created_at').map(d => ({
          date: d.date,
          avgGrammar: d.value,
          count: d.count
        })),
        complexityTrends: aggregateByDate(langMetrics || [], 'conversation_complexity', 'created_at').map(d => ({
          date: d.date,
          avgComplexity: d.value,
          count: d.count
        })),
        pronunciationTrends: aggregateByDate(langMetrics || [], 'pronunciation_accuracy', 'created_at').map(d => ({
          date: d.date,
          avgPronunciation: d.value,
          count: d.count
        }))
      };
    },
    enabled: !!teacherId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statCards = [
    {
      title: t("totalStudents"),
      value: stats?.totalStudents || 0,
      icon: Users,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30'
    },
    {
      title: t("totalClasses"),
      value: stats?.totalClasses || 0,
      icon: GraduationCap,
      gradient: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: t("completedAssignments"),
      value: stats?.completedAssignments || 0,
      icon: CheckCircle,
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-500',
      borderColor: 'border-violet-500/30'
    },
    {
      title: t("averageGrade"),
      value: `${stats?.averageGrade || 0}%`,
      icon: TrendingUp,
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/30'
    }
  ];

  // Show empty state when no classes
  if (stats?.totalClasses === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <CardContent className="py-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4"
            >
              <GraduationCap className="h-12 w-12 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">{t("noClassesYet")}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {t("noClassesYetDescription")}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Card className={`glass ${stat.borderColor} bg-gradient-to-br ${stat.gradient} hover:shadow-lg transition-all duration-300`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} backdrop-blur-sm shrink-0`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Students Needing Attention */}
        {(stats?.studentsNeedingAttention || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="glass border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{stats?.studentsNeedingAttention} {t("studentsNeedAttention")}</p>
                    <p className="text-sm text-muted-foreground">{t("noActivityIn7Days")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top Performers */}
        {stats?.topPerformers && stats.topPerformers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="glass border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Award className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t("topPerformers")}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.topPerformers.slice(0, 3).map(p => p.display_name || 'Student').join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Charts */}
      {chartsLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ClassScoreProgressionChart data={chartData?.scoreProgression || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ClassGrammarAccuracyChart data={chartData?.grammarTrends || []} />
            <ClassConversationComplexityChart data={chartData?.complexityTrends || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ClassPronunciationAccuracyChart data={chartData?.pronunciationTrends || []} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassPerformanceOverview;
