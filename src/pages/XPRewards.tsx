import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { useLocalization } from '@/context/LocalizationContext';
import AnimatedLoader from '@/components/ui/animated-loader';
import StudentXPDashboard from '@/components/xp/StudentXPDashboard';
import TeacherXPOverview from '@/components/xp/TeacherXPOverview';

const XPRewards = () => {
  const { t } = useLocalization();
  const { progression, loading: gamificationLoading } = useGamification();
  const { isTeacher, isLoading: teacherLoading } = useTeacherStatus();

  const isLoading = gamificationLoading || teacherLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <AnimatedLoader size="lg" message="Loading XP data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold gradient-text">
          {t("xpRewards") || "XP & Rewards"}
        </h1>
      </div>

      {isTeacher ? (
        <TeacherXPOverview />
      ) : (
        <StudentXPDashboard progression={progression} />
      )}
    </div>
  );
};

export default XPRewards;
