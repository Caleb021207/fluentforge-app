
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLocalization } from "@/context/LocalizationContext";
import StudentClassView from "@/components/classroom/StudentClassView";
import JoinClassForm from "@/components/classroom/JoinClassForm";

const StudentClass = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();
  const { isTeacher, isLoading: teacherStatusLoading } = useTeacherStatus();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();

  const isLoading = teacherStatusLoading || authLoading;

  useEffect(() => {
    if (!isLoading) {
      if (isTeacher) {
        navigate('/teacher/classes');
      }
    }
  }, [isTeacher, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-foreground">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-foreground">{t("myClass")}</h1>
      <StudentClassView />
      <JoinClassForm />
    </div>
  );
};

export default StudentClass;
