
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useClassroomText } from "@/hooks/useClassroomText";
import GenerateCodeDialog from "@/components/classroom/GenerateCodeDialog";
import ClassList from "@/components/classroom/ClassList";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";

const TeacherClasses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const classroomText = useClassroomText();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isTeacher, isLoading } = useTeacherStatus();

  useEffect(() => {
    if (!isLoading && !isTeacher) {
      navigate('/');
      toast({
        title: "Unauthorized",
        description: classroomText.TEACHER_ACCESS_REQUIRED,
        variant: "destructive",
      });
    }
  }, [isTeacher, isLoading, navigate, toast]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{classroomText.MY_CLASSES}</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          {classroomText.GENERATE_CODE}
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
