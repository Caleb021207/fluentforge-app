
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

        // First get the classroom membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('classroom_memberships')
          .select('classroom_id, joined_at')
          .eq('student_id', userData.user.id)
          .maybeSingle();

        if (membershipError) throw membershipError;
        
        if (!membershipData) {
          setIsLoading(false);
          return; // No class joined
        }
        
        // Then get the classroom details
        const { data: classroomData, error: classroomError } = await supabase
          .from('classroom_codes')
          .select('class_name, code, teacher_id')
          .eq('id', membershipData.classroom_id)
          .single();
          
        if (classroomError) throw classroomError;
        
        // Get teacher email if teacher_id exists
        let teacherEmail = null;
        if (classroomData.teacher_id) {
          const { data: teacherData, error: teacherError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', classroomData.teacher_id)
            .single();
            
          if (teacherError) {
            console.error('Error fetching teacher email:', teacherError);
          } else if (teacherData) {
            teacherEmail = teacherData.email;
          }
        }

        setClassData({
          class_name: classroomData.class_name,
          teacher_email: teacherEmail || undefined,
          joined_at: membershipData.joined_at ? new Date(membershipData.joined_at).toLocaleDateString() : '',
          code: classroomData.code
        });
      } catch (error: any) {
        console.error('Error fetching class data:', error);
        toast({
          title: t("error") || "Error",
          description: error.message || "Failed to load class data",
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
          <p className="text-muted-foreground">{t("noClassJoined") || "No class joined yet"}</p>
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
            <span className="font-medium">{t("teacher") || "Teacher"}:</span> {classData.teacher_email}
          </div>
        )}
        {classData.joined_at && (
          <div>
            <span className="font-medium">{t("joined") || "Joined"}:</span> {classData.joined_at}
          </div>
        )}
        {classData.code && (
          <div>
            <span className="font-medium">{t("classCode") || "Class Code"}:</span> {classData.code}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentClassView;
