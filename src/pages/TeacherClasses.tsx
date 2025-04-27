
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import GenerateCodeDialog from "@/components/classroom/GenerateCodeDialog";
import ClassList from "@/components/classroom/ClassList";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";

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
        description: t("teacherAccessRequired"),
        variant: "destructive",
      });
    }
  }, [isTeacher, isLoading, navigate, toast, t]);

  if (isLoading) {
    return <div className="p-8">{t("loading")}...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t("myClasses")}</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          {t("generateCode")}
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
