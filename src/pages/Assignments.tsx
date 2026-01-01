import React, { useState, useEffect } from 'react';
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { useLocalization } from '@/context/LocalizationContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedLoader from '@/components/ui/animated-loader';
import StudentAssignmentsView from '@/components/assignments/StudentAssignmentsView';
import TeacherAssignmentsPage from '@/components/assignments/TeacherAssignmentsPage';

const Assignments = () => {
  const { t } = useLocalization();
  const { isTeacher, teacherId, isLoading: teacherLoading } = useTeacherStatus();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  const isLoading = teacherLoading || authLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <AnimatedLoader size="lg" message="Loading assignments..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
        <p className="text-muted-foreground">Please sign in to view your assignments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold gradient-text">
          {t("assignments") || "Assignments"}
        </h1>
      </div>

      {isTeacher ? (
        <TeacherAssignmentsPage teacherId={teacherId!} />
      ) : (
        <StudentAssignmentsView />
      )}
    </div>
  );
};

export default Assignments;
