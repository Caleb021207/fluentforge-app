import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AssignmentAnalyticsProps {
  teacherId: string | undefined;
}

interface AssignmentData {
  id: string;
  title: string;
  className: string;
  dueDate: string | null;
  totalStudents: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number;
  averageDuration: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

const AssignmentAnalytics = ({ teacherId }: AssignmentAnalyticsProps) => {
  const { t } = useLocalization();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['assignment-analytics', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;

      // Get classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherId);

      if (!classes?.length) return { assignments: [], summary: null };

      const classIds = classes.map(c => c.id);
      const classMap = new Map(classes.map(c => [c.id, c.name]));

      // Get assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .in('class_id', classIds)
        .order('created_at', { ascending: false });

      if (!assignments?.length) return { assignments: [], summary: null };

      // Get enrollments per class
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('class_id, student_id')
        .in('class_id', classIds);

      const studentsPerClass = new Map<string, number>();
      enrollments?.forEach(e => {
        studentsPerClass.set(e.class_id!, (studentsPerClass.get(e.class_id!) || 0) + 1);
      });

      // Get all submissions
      const assignmentIds = assignments.map(a => a.id);
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .in('assignment_id', assignmentIds);

      // Build assignment data
      const now = new Date();
      const assignmentData: AssignmentData[] = assignments.map(assignment => {
        const totalStudents = studentsPerClass.get(assignment.class_id!) || 0;
        const assignmentSubmissions = submissions?.filter(s => s.assignment_id === assignment.id) || [];
        
        const completed = assignmentSubmissions.filter(s => s.status === 'completed').length;
        const pending = assignmentSubmissions.filter(s => s.status === 'pending' || s.status === 'in_progress').length;
        
        const isOverdue = assignment.due_date && new Date(assignment.due_date) < now;
        const overdue = isOverdue ? totalStudents - completed - pending : 0;

        const completedWithScores = assignmentSubmissions.filter(s => s.status === 'completed' && s.ai_score != null);
        const avgScore = completedWithScores.length > 0
          ? completedWithScores.reduce((sum, s) => sum + (s.ai_score || 0), 0) / completedWithScores.length
          : 0;

        const completedWithDuration = assignmentSubmissions.filter(s => s.status === 'completed' && s.duration_seconds);
        const avgDuration = completedWithDuration.length > 0
          ? completedWithDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / completedWithDuration.length / 60
          : 0;

        return {
          id: assignment.id,
          title: assignment.title,
          className: classMap.get(assignment.class_id!) || '',
          dueDate: assignment.due_date,
          totalStudents,
          completed,
          pending,
          overdue: Math.max(0, overdue),
          averageScore: Math.round(avgScore),
          averageDuration: Math.round(avgDuration)
        };
      });

      // Calculate summary stats
      const totalAssignments = assignmentData.length;
      const totalCompleted = assignmentData.reduce((sum, a) => sum + a.completed, 0);
      const totalPossible = assignmentData.reduce((sum, a) => sum + a.totalStudents, 0);
      const overallCompletionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
      const avgClassScore = assignmentData.reduce((sum, a) => sum + a.averageScore, 0) / (totalAssignments || 1);

      return {
        assignments: assignmentData,
        summary: {
          totalAssignments,
          completionRate: Math.round(overallCompletionRate),
          averageScore: Math.round(avgClassScore),
          totalSubmissions: totalCompleted
        }
      };
    },
    enabled: !!teacherId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const summary = analyticsData?.summary;
  const assignments = analyticsData?.assignments || [];

  // Prepare chart data
  const completionChartData = assignments.slice(0, 10).map(a => ({
    name: a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title,
    completed: a.completed,
    pending: a.pending,
    overdue: a.overdue
  }));

  const statusDistribution = [
    { name: t("completed"), value: assignments.reduce((sum, a) => sum + a.completed, 0) },
    { name: t("pending"), value: assignments.reduce((sum, a) => sum + a.pending, 0) },
    { name: t("overdue"), value: assignments.reduce((sum, a) => sum + a.overdue, 0) }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{summary?.totalAssignments || 0}</p>
                  <p className="text-sm text-muted-foreground truncate">{t("totalAssignments")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{summary?.completionRate || 0}%</p>
                  <p className="text-sm text-muted-foreground truncate">{t("completionRate")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{summary?.averageScore || 0}%</p>
                  <p className="text-sm text-muted-foreground truncate">{t("averageScore")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 shrink-0">
                  <Users className="h-5 w-5 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{summary?.totalSubmissions || 0}</p>
                  <p className="text-sm text-muted-foreground truncate">{t("totalSubmissions")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("assignmentCompletion")}</CardTitle>
            </CardHeader>
            <CardContent>
              {completionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name={t("completed")} />
                    <Bar dataKey="pending" stackId="a" fill="hsl(var(--muted))" name={t("pending")} />
                    <Bar dataKey="overdue" stackId="a" fill="hsl(var(--destructive))" name={t("overdue")} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {t("noAssignmentsYet")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("statusDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {t("noDataAvailable")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Assignment List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("recentAssignments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("noAssignmentsYet")}</p>
              ) : (
                assignments.slice(0, 5).map(assignment => (
                  <div key={assignment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium truncate">{assignment.title}</p>
                        <Badge variant="outline" className="shrink-0">{assignment.className}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {assignment.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {assignment.completed}/{assignment.totalStudents}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{assignment.averageScore}%</p>
                        <Progress 
                          value={assignment.totalStudents > 0 ? (assignment.completed / assignment.totalStudents) * 100 : 0} 
                          className="w-20 sm:w-24 h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AssignmentAnalytics;
