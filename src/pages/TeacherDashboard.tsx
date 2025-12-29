import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp,
  ArrowLeft,
  FolderOpen
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

  const { unreadCount } = useTeacherNotifications(user?.id);

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              {t("teacherDashboard")}
            </h1>
            <p className="text-muted-foreground">
              {profile?.display_name} • {profile?.school?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium">
              {unreadCount} {t("newNotifications")}
            </span>
          )}
          <ExportReportButton teacherId={user?.id} />
        </div>
      </motion.div>

      {/* Dashboard Tabs - Now with 4 tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t("overview")}</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t("classes") || "Classes"}</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t("students")}</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t("assignments")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClassPerformanceOverview teacherId={user?.id} />
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <TeacherClassesTab teacherId={user?.id} />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentProgressTable 
            teacherId={user?.id}
            onStudentSelect={(studentId) => setSelectedStudentId(studentId)}
          />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <AssignmentAnalytics teacherId={user?.id} />
        </TabsContent>
      </Tabs>

      {/* Student Detail Modal */}
      <StudentDetailModal
        studentId={selectedStudentId}
        open={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
};

export default TeacherDashboard;
