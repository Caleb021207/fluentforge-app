
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { Loader2 } from "lucide-react";

interface ClassData {
  class_name: string;
  teacher_email?: string;
  joined_at: string;
  code: string;
}

const StudentClassView = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
          .from('classroom_memberships')
          .select(`
            classroom_id,
            joined_at,
            classrooms:classroom_id (
              class_name,
              code,
              teacher_id,
              teacher:teacher_id (
                email
              )
            )
          `)
          .eq('student_id', userData.user.id)
          .single();

        if (error) throw error;

        if (data) {
          const teacherEmail = data.classrooms?.teacher?.email;
          
          setClassData({
            class_name: data.classrooms.class_name,
            teacher_email: teacherEmail,
            joined_at: new Date(data.joined_at).toLocaleDateString(),
            code: data.classrooms.code
          });
        }
      } catch (error: any) {
        console.error('Error fetching class data:', error);
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [toast, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t("noClassJoined")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{classData.class_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {classData.teacher_email && (
          <div>
            <span className="font-medium">{t("teacher")}:</span> {classData.teacher_email}
          </div>
        )}
        <div>
          <span className="font-medium">{t("joined")}:</span> {classData.joined_at}
        </div>
        <div>
          <span className="font-medium">{t("classCode")}:</span> {classData.code}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentClassView;
