
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import GenerateCodeDialog from "@/components/classroom/GenerateCodeDialog";
import ClassList from "@/components/classroom/ClassList";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useLocalization } from "@/context/LocalizationContext";
import { CLASSROOM_TEXT } from "@/constants/classroomText";

const TeacherClasses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isTeacher, isLoading } = useTeacherStatus();

  useEffect(() => {
    if (!isLoading && !isTeacher) {
      navigate('/');
      toast({
        title: t("unauthorized"),
        description: CLASSROOM_TEXT.TEACHER_ACCESS_REQUIRED,
        variant: "destructive",
      });
    }
  }, [isTeacher, isLoading, navigate, toast, t]);

  if (isLoading) {
    return <div className="p-8">{t("loading")}</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{CLASSROOM_TEXT.MY_CLASSES}</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          {CLASSROOM_TEXT.GENERATE_CODE}
        </Button>
      </div>
      
      <ClassList />
      
      <GenerateCodeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default TeacherClasses;
