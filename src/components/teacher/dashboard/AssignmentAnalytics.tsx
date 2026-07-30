import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  PlusCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isFinished, isInProgress } from '@/utils/assignmentStatus';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  /** Jump to the class management tab, where assignments are created. */
  onCreateAssignment?: () => void;
}

interface AssignmentData {
  id: string;
  title: string;
  className: string;
  dueDate: string | null;
  totalStudents: number;
  completed: number;
  inProgress: number;
  unopened: number;
  averageScore: number;
  averageDuration: number;
}

// Vibrant, high-contrast colors for status distribution
const STATUS_COLORS = {
  completed: '#10b981',    // Emerald green - vibrant
  inProgress: '#f59e0b',   // Amber/orange - warm
  unopened: '#64748b'      // Slate gray - neutral
};

const AssignmentAnalytics = ({ teacherId, onCreateAssignment }: AssignmentAnalyticsProps) => {
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
      const assignmentData: AssignmentData[] = assignments.map(assignment => {
        const totalStudents = studentsPerClass.get(assignment.class_id!) || 0;
        const assignmentSubmissions = submissions?.filter(s => s.assignment_id === assignment.id) || [];
        
        // Finished: student completed the work (whether or not it's been graded)
        const completed = assignmentSubmissions.filter(s => isFinished(s.status)).length;
        // In Progress: student has an open submission (assigned or actively working)
        const inProgress = assignmentSubmissions.filter(s => isInProgress(s.status) || s.status === 'pending').length;
        // Everything else (e.g. marked incomplete, or students with no
        // submission row at all) counts as not completed.
        const unopened = Math.max(0, totalStudents - completed - inProgress);

        const completedWithScores = assignmentSubmissions.filter(s => isFinished(s.status) && s.score != null);
        const avgScore = completedWithScores.length > 0
          ? completedWithScores.reduce((sum, s) => sum + (s.score || 0), 0) / completedWithScores.length
          : 0;

        // Duration not tracked — default to 0
        const avgDuration = 0;

        return {
          id: assignment.id,
          title: assignment.title,
          className: classMap.get(assignment.class_id!) || '',
          dueDate: assignment.due_date,
          totalStudents,
          completed,
          inProgress,
          unopened,
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
    inProgress: a.inProgress,
    unopened: a.unopened
  }));

  const statusDistribution = [
    { name: t("completed"), value: assignments.reduce((sum, a) => sum + a.completed, 0), color: STATUS_COLORS.completed },
    { name: t("inProgress"), value: assignments.reduce((sum, a) => sum + a.inProgress, 0), color: STATUS_COLORS.inProgress },
    { name: t("unopened"), value: assignments.reduce((sum, a) => sum + a.unopened, 0), color: STATUS_COLORS.unopened }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Create action — assignment creation lives on each class card. */}
      {onCreateAssignment && (
        <div className="flex justify-end">
          <Button onClick={onCreateAssignment} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t("createAssignment") || "Create Assignment"}
          </Button>
        </div>
      )}

      {/* Summary Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Card className="glass border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold">{summary?.totalAssignments || 0}</p>
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
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Card className="glass border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold">{summary?.completionRate || 0}%</p>
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
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Card className="glass border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold">{summary?.averageScore || 0}%</p>
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
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Card className="glass border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 shrink-0">
                  <Users className="h-6 w-6 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold">{summary?.totalSubmissions || 0}</p>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass border-blue-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                {t("assignmentCompletion")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {completionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="unopenedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#64748b" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12} 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid rgb(59 130 246 / 0.5)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                      }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                    />
                    <Bar dataKey="completed" stackId="a" fill="url(#completedGradient)" name={t("completed")} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inProgress" stackId="a" fill="url(#inProgressGradient)" name={t("inProgress")} />
                    <Bar dataKey="unopened" stackId="a" fill="url(#unopenedGradient)" name={t("unopened")} radius={[4, 4, 0, 0]} />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass border-violet-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg border border-violet-500/30">
                  <CheckCircle className="h-5 w-5 text-violet-500" />
                </div>
                {t("statusDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {statusDistribution.length > 0 ? (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        style={{ filter: 'url(#shadow)' }}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="hsl(var(--background))"
                            strokeWidth={3}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid rgb(139 92 246 / 0.5)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {statusDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border border-primary/30">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              {t("recentAssignments")}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("noAssignmentsYet")}</p>
              ) : (
                assignments.slice(0, 5).map((assignment, index) => (
                  <motion.div 
                    key={assignment.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-muted/50 to-transparent hover:from-primary/10 hover:to-accent/5 transition-all gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold truncate">{assignment.title}</p>
                        <Badge className="shrink-0 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">{assignment.className}</Badge>
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
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${assignment.averageScore >= 70 ? 'text-emerald-500' : assignment.averageScore >= 50 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {assignment.averageScore}%
                        </span>
                        <Progress 
                          value={assignment.totalStudents > 0 ? (assignment.completed / assignment.totalStudents) * 100 : 0} 
                          className="w-24 h-2.5"
                        />
                      </div>
                    </div>
                  </motion.div>
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
