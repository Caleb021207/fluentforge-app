
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import GenerateCodeDialog from "@/components/classroom/GenerateCodeDialog";
import ClassList from "@/components/classroom/ClassList";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import { useLocalization } from "@/context/LocalizationContext";
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import AnimatedLoader from "@/components/ui/animated-loader";
import { ChartLine } from "lucide-react";

const TeacherClasses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isTeacher, isLoading } = useTeacherStatus();
  const [selectedClass, setSelectedClass] = useState<{ id: string, name: string } | null>(null);

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

  const handleViewLanguageProgress = (classId: string, className: string) => {
    navigate(`/teacher/student-language-progress?classroomId=${classId}&className=${encodeURIComponent(className)}`);
  };

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
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{CLASSROOM_TEXT.MY_CLASSES}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)}>
            {CLASSROOM_TEXT.GENERATE_CODE}
          </Button>
        </div>
      </div>
      
      <ClassList 
        onClassSelect={(classId, className) => setSelectedClass({ id: classId, name: className })}
      />

      {selectedClass && (
        <div className="mt-4 p-4 border rounded-md bg-muted/10">
          <h3 className="font-medium mb-2">
            {t("selectedClass") || "Selected Class"}: {selectedClass.name}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewLanguageProgress(selectedClass.id, selectedClass.name)}
              className="flex items-center"
            >
              <ChartLine className="h-4 w-4 mr-2" />
              {t("viewLanguageProgress") || "View Language Progress"}
            </Button>
          </div>
        </div>
      )}
      
      <GenerateCodeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default TeacherClasses;
