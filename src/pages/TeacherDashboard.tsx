import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  TrendingUp,
  ArrowLeft,
  FolderOpen,
  Sparkles,
  BookOpen,
  Target,
  GraduationCap
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ClassPerformanceOverview from '@/components/teacher/dashboard/ClassPerformanceOverview';
import StudentProgressTable from '@/components/teacher/dashboard/StudentProgressTable';
import AssignmentAnalytics from '@/components/teacher/dashboard/AssignmentAnalytics';
import StudentDetailModal from '@/components/teacher/dashboard/StudentDetailModal';
import ExportReportButton from '@/components/teacher/dashboard/ExportReportButton';
import TeacherClassesTab from '@/components/teacher/dashboard/TeacherClassesTab';
import NotificationDropdown from '@/components/teacher/dashboard/NotificationDropdown';
import { useTeacherNotifications } from '@/hooks/useTeacherNotifications';

const TeacherDashboard = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['teacher-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, school:schools(name)')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { notifications, unreadCount, refetch: refetchNotifications } = useTeacherNotifications(user?.id);

  if (profileLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden flex items-center justify-center">
        <Card className="glass border-primary/20">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("accessDenied")}</p>
            <Button onClick={() => navigate('/profile')} className="mt-4">
              {t("backToProfile")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palavox-teal/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/profile')}
                className="shrink-0 h-12 w-12 rounded-xl border-primary/20 hover:bg-primary/10 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                  className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-sm border border-primary/20"
                >
                  <GraduationCap className="w-8 h-8 text-primary" />
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
                    {t("teacherDashboard")}
                  </h1>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {profile?.display_name} • {(profile?.school as any)?.name || t("teacherTools")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 w-full lg:w-auto"
          >
            <NotificationDropdown 
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={refetchNotifications}
            />
            <ExportReportButton teacherId={user?.id} />
          </motion.div>
        </motion.div>

        {/* Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass border-primary/20 p-1.5 h-auto grid w-full grid-cols-2 sm:grid-cols-3 lg:w-auto lg:inline-flex gap-1">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30 transition-all"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">{t("overview")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="classes" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30 transition-all"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="font-medium">{t("manageClasses")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="students" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30 transition-all"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">{t("students")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assignments" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30 transition-all"
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium">{t("assignments")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="curriculum" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30 transition-all"
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Curriculum</span>
              </TabsTrigger>
              <TabsTrigger 
                value="benchmarks" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border data-[state=active]:border-primary/30 transition-all"
              >
                <Target className="h-4 w-4" />
                <span className="font-medium">Benchmarks</span>
              </TabsTrigger>
            </TabsList>


            <TabsContent value="overview" className="space-y-6 mt-6">
              <ClassPerformanceOverview teacherId={user?.id} />
            </TabsContent>

            <TabsContent value="classes" className="space-y-6 mt-6">
              <TeacherClassesTab teacherId={user?.id} />
            </TabsContent>

            <TabsContent value="students" className="space-y-6 mt-6">
              <StudentProgressTable 
                teacherId={user?.id}
                onStudentSelect={(studentId) => setSelectedStudentId(studentId)}
              />
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6 mt-6">
              <AssignmentAnalytics teacherId={user?.id} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Student Detail Modal */}
        <StudentDetailModal
          studentId={selectedStudentId}
          open={!!selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
