
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import StudentLanguageProgressChart from '@/components/classroom/StudentLanguageProgressChart';
import { CLASSROOM_TEXT } from '@/constants/classroomText';
import { Button } from '@/components/ui/button';
import AnimatedLoader from '@/components/ui/animated-loader';
import { ChevronLeft } from 'lucide-react';

const StudentLanguageProgress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get('classroomId');
  const className = searchParams.get('className');
  const { toast } = useToast();
  const { t } = useLocalization();
  const { isTeacher, isLoading } = useTeacherStatus();

  // Redirect non-teachers
  React.useEffect(() => {
    if (!isLoading && !isTeacher) {
      navigate('/');
      toast({
        title: t("unauthorized"),
        description: CLASSROOM_TEXT.TEACHER_ACCESS_REQUIRED,
        variant: "destructive",
      });
    }

    if (!classroomId) {
      navigate('/teacher/classes');
      toast({
        title: t("error"),
        description: t("noClassroomSelected") || "No classroom selected",
        variant: "destructive",
      });
    }
  }, [isTeacher, isLoading, classroomId, navigate, toast, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <AnimatedLoader 
          size="lg" 
          color="text-palavox-primary"
          message={t("loading")}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate('/teacher/classes')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("backToClasses") || "Back to Classes"}
          </Button>
          <h1 className="text-2xl font-bold">
            {t("studentLanguageProgress") || "Student Language Progress"}
            {className && <span className="text-muted-foreground"> - {className}</span>}
          </h1>
        </div>
      </div>
      
      {classroomId && (
        <StudentLanguageProgressChart classroomId={classroomId} />
      )}
    </div>
  );
};

export default StudentLanguageProgress;
