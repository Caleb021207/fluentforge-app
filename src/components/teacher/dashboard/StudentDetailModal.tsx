import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  BookOpen, 
  Award,
  Calendar,
  Target,
  MessageSquare,
  Mic
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/context/LocalizationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface StudentDetailModalProps {
  studentId: string | null;
  open: boolean;
  onClose: () => void;
}

const StudentDetailModal = ({ studentId, open, onClose }: StudentDetailModalProps) => {
  const { t } = useLocalization();

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['student-detail', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      // Learning profile removed — no longer tracked
      const learningProfile: any = null;

      // Get language metrics over time
      const { data: metrics } = await supabase
        .from('student_language_metrics')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: true });

      // Get assignment submissions
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments (
            title,
            class_id
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      // Get transcript analyses
      const { data: analyses } = await supabase
        .from('transcript_analyses')
        .select('*')
        .eq('user_id', studentId)
        .order('upload_date', { ascending: true });

      // Get student metrics
      const { data: studentMetrics } = await supabase
        .from('student_metrics')
        .select('*')
        .eq('student_id', studentId)
        .single();

      // Process metrics for charts
      const grammarTrends = metrics?.map(m => ({
        date: format(new Date(m.created_at), 'MMM d'),
        value: m.grammar_accuracy || 0
      })) || [];

      const complexityTrends = metrics?.map(m => ({
        date: format(new Date(m.created_at), 'MMM d'),
        value: m.conversation_complexity || 0
      })) || [];

      const pronunciationTrends = metrics?.map(m => ({
        date: format(new Date(m.created_at), 'MMM d'),
        value: m.pronunciation_accuracy || 0
      })) || [];

      const scoreTrends = analyses?.map(a => ({
        date: format(new Date(a.upload_date), 'MMM d'),
        value: a.overall_score || 0
      })) || [];

      // Calculate stats
      const completedSubmissions = submissions?.filter(s => s.status === 'completed') || [];
      const avgScore = completedSubmissions.length > 0
        ? completedSubmissions.reduce((sum, s) => sum + ((s as any).score || 0), 0) / completedSubmissions.length
        : 0;

      return {
        profile,
        learningProfile,
        metrics: {
          grammar: grammarTrends,
          complexity: complexityTrends,
          pronunciation: pronunciationTrends,
          scores: scoreTrends
        },
        submissions: submissions || [],
        studentMetrics,
        stats: {
          totalAssignments: submissions?.length || 0,
          completedAssignments: completedSubmissions.length,
          averageScore: Math.round(avgScore),
          cefrLevel: learningProfile?.estimated_cefr_level || profile?.target_level || 'N/A',
          actflLevel: learningProfile?.estimated_actfl_level || 'N/A',
          textPracticeCalls: studentMetrics?.text_practice_calls || 0,
          voiceCalls: studentMetrics?.premium_voice_calls || 0,
          lastActivity: studentMetrics?.last_activity
        }
      };
    },
    enabled: !!studentId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {studentData?.profile?.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="text-xl">{studentData?.profile?.display_name || t("student")}</p>
              <p className="text-sm text-muted-foreground font-normal">
                {studentData?.profile?.email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : studentData ? (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{t("level")}</span>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {studentData.stats.cefrLevel}
                    {studentData.stats.actflLevel !== 'N/A' && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({studentData.stats.actflLevel})
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">{t("assignments")}</span>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {studentData.stats.completedAssignments}/{studentData.stats.totalAssignments}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">{t("avgScore")}</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{studentData.stats.averageScore}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">{t("lastActive")}</span>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {studentData.stats.lastActivity 
                      ? format(new Date(studentData.stats.lastActivity), 'MMM d')
                      : t("never")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Practice Activity */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentData.stats.textPracticeCalls}</p>
                    <p className="text-sm text-muted-foreground">{t("textPracticeSessions")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-violet-500/10">
                    <Mic className="h-6 w-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentData.stats.voiceCalls}</p>
                    <p className="text-sm text-muted-foreground">{t("voicePracticeSessions")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts */}
            <Tabs defaultValue="grammar" className="space-y-4">
              <TabsList>
                <TabsTrigger value="grammar">{t("grammar")}</TabsTrigger>
                <TabsTrigger value="complexity">{t("complexity")}</TabsTrigger>
                <TabsTrigger value="pronunciation">{t("pronunciation")}</TabsTrigger>
                <TabsTrigger value="scores">{t("testScores")}</TabsTrigger>
              </TabsList>

              <TabsContent value="grammar">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("grammarAccuracyOverTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentData.metrics.grammar.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={studentData.metrics.grammar}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">{t("noDataAvailable")}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complexity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("conversationComplexityOverTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentData.metrics.complexity.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={studentData.metrics.complexity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(142, 76%, 36%)" 
                            fill="hsl(142, 76%, 36%)" 
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">{t("noDataAvailable")}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pronunciation">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("pronunciationAccuracyOverTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentData.metrics.pronunciation.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={studentData.metrics.pronunciation}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(262, 83%, 58%)" 
                            fill="hsl(262, 83%, 58%)" 
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">{t("noDataAvailable")}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scores">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("testScoresOverTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentData.metrics.scores.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={studentData.metrics.scores}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">{t("noDataAvailable")}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("recentSubmissions")}</CardTitle>
              </CardHeader>
              <CardContent>
                {studentData.submissions.length > 0 ? (
                  <div className="space-y-3">
                    {studentData.submissions.slice(0, 5).map(submission => (
                      <div 
                        key={submission.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{submission.assignments?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.submitted_at 
                              ? format(new Date(submission.submitted_at), 'MMM d, yyyy')
                              : t("inProgress")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={submission.status === 'completed' ? 'default' : 'secondary'}>
                            {submission.status}
                          </Badge>
                          {submission.score != null && (
                            <span className={`font-bold ${
                              submission.score >= 70 ? 'text-emerald-500' : 
                              submission.score >= 50 ? 'text-amber-500' : 'text-destructive'
                            }`}>
                              {submission.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t("noSubmissionsYet")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailModal;
