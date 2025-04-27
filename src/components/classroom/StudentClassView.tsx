
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { Loader2 } from "lucide-react";

interface ClassData {
  class_name: string;
  teacher_email?: string;
  teacher_name?: string;
  joined_at: string;
  code: string;
}

const StudentClassView = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session.session) {
          setError("No authenticated session");
          setIsLoading(false);
          return;
        }

        // First get the classroom membership with the classroom code
        const { data: membershipData, error: membershipError } = await supabase
          .from('classroom_memberships')
          .select(`
            joined_at,
            classroom: classroom_codes (
              class_name,
              code,
              teacher_id
            )
          `)
          .eq('student_id', session.session.user.id)
          .maybeSingle();

        if (membershipError) throw membershipError;
        
        if (!membershipData) {
          setIsLoading(false);
          return; // No class joined
        }

        // Then get the teacher's profile information in a separate query
        const teacherId = membershipData.classroom?.teacher_id;
        
        let teacherEmail = undefined;
        let teacherName = undefined;
        
        if (teacherId) {
          const { data: teacherData, error: teacherError } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', teacherId)
            .maybeSingle();
          
          if (teacherError) {
            console.error('Error fetching teacher data:', teacherError);
          } else if (teacherData) {
            teacherEmail = teacherData.email;
            teacherName = teacherData.display_name;
          }
        }

        // Transform the data to match our ClassData interface
        const classInfo: ClassData = {
          class_name: membershipData.classroom?.class_name || 'Unknown Class',
          teacher_email: teacherEmail,
          teacher_name: teacherName,
          joined_at: new Date(membershipData.joined_at).toLocaleDateString(),
          code: membershipData.classroom?.code || 'Unknown Code'
        };

        setClassData(classInfo);
      } catch (error: any) {
        console.error('Error fetching class data:', error);
        setError(error.message);
        toast({
          title: t("error"),
          description: error.message || t("failedToLoadClassData"),
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

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
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
        {(classData.teacher_name || classData.teacher_email) && (
          <div>
            <span className="font-medium">{t("teacher")}:</span>{' '}
            {classData.teacher_name || classData.teacher_email}
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
