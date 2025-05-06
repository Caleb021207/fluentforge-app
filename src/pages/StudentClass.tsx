
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useClassroomText } from "@/hooks/useClassroomText";
import StudentClassView from "@/components/classroom/StudentClassView";
import JoinClassForm from "@/components/classroom/JoinClassForm";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

const StudentClass = () => {
  const navigate = useNavigate();
  const { isTeacher, isLoading: teacherStatusLoading } = useTeacherStatus();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard();
  const classroomText = useClassroomText();

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
        <span className="ml-3 text-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 text-foreground">{CLASSROOM_TEXT.MY_CLASS}</h1>
      <StudentClassView />
      <JoinClassForm />
    </div>
  );
};

export default StudentClass;
