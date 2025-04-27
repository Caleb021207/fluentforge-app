
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useLocalization } from "@/context/LocalizationContext";

const StudentClass = () => {
  const navigate = useNavigate();
  const { isTeacher, isLoading } = useTeacherStatus();
  const { t } = useLocalization();

  useEffect(() => {
    if (!isLoading && isTeacher) {
      navigate('/teacher/classes');
    }
  }, [isTeacher, isLoading, navigate]);

  if (isLoading) {
    return <div className="p-8">{t("loading")}...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">{t("myClass")}</h1>
      <StudentClassView />
      <JoinClassForm />
    </div>
  );
};

export default StudentClass;
