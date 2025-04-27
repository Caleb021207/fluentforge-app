
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
  metrics?: {
    voice_chat_sessions: number;
    voice_chat_minutes: number;
    text_inputs: number;
    text_outputs: number;
    premium_voice_sessions: number;
    premium_voice_minutes: number;
    certification_attempts: number;
    highest_certification_score: number;
    completed_lessons: number;
    total_lessons: number;
    last_activity: string | null;
  };
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
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          setError("No authenticated session");
          setIsLoading(false);
          return;
        }

        // First fetch the classroom membership data
        const { data: membershipData, error: membershipError } = await supabase
          .from('classroom_memberships')
          .select(`
            joined_at,
            classroom:classroom_codes!inner (
              class_name,
              code,
              teacher_id
            )
          `)
          .maybeSingle();

        if (membershipError) throw membershipError;
        
        if (!membershipData) {
          setIsLoading(false);
          return;
        }

        // Then fetch the teacher data
        let teacherName = undefined;
        let teacherEmail = undefined;

        if (membershipData.classroom.teacher_id) {
          const { data: teacherData } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', membershipData.classroom.teacher_id)
            .maybeSingle();

          if (teacherData) {
            teacherEmail = teacherData.email;
            teacherName = teacherData.display_name;
          }
        }

        // Fetch student metrics
        const { data: metricsData } = await supabase
          .from('class_student_metrics')
          .select('*')
          .eq('classroom_id', membershipData.classroom.id)
          .eq('student_id', session.session.user.id)
          .maybeSingle();

        const classInfo: ClassData = {
          class_name: membershipData.classroom.class_name,
          teacher_email: teacherEmail,
          teacher_name: teacherName,
          joined_at: new Date(membershipData.joined_at).toLocaleDateString(),
          code: membershipData.classroom.code,
          metrics: metricsData || undefined
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
      <CardContent className="space-y-4">
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

        {classData.metrics && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">{t("yourProgress")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t("completedLessons")}:</span>{' '}
                {classData.metrics.completed_lessons} / {classData.metrics.total_lessons}
              </div>
              <div>
                <span className="font-medium">{t("certificationAttempts")}:</span>{' '}
                {classData.metrics.certification_attempts}
              </div>
              {classData.metrics.highest_certification_score > 0 && (
                <div>
                  <span className="font-medium">{t("highestScore")}:</span>{' '}
                  {classData.metrics.highest_certification_score}%
                </div>
              )}
              <div>
                <span className="font-medium">{t("voiceChatSessions")}:</span>{' '}
                {classData.metrics.voice_chat_sessions}
              </div>
              <div>
                <span className="font-medium">{t("voiceChatMinutes")}:</span>{' '}
                {Math.round(classData.metrics.voice_chat_minutes)} min
              </div>
              <div>
                <span className="font-medium">{t("textInputs")}:</span>{' '}
                {classData.metrics.text_inputs}
              </div>
              <div>
                <span className="font-medium">{t("textOutputs")}:</span>{' '}
                {classData.metrics.text_outputs}
              </div>
              <div>
                <span className="font-medium">{t("unlimitedSessions")}:</span>{' '}
                {classData.metrics.premium_voice_sessions}
              </div>
              <div>
                <span className="font-medium">{t("unlimitedMinutes")}:</span>{' '}
                {Math.round(classData.metrics.premium_voice_minutes)} min
              </div>
              {classData.metrics.last_activity && (
                <div>
                  <span className="font-medium">{t("lastActivity")}:</span>{' '}
                  {new Date(classData.metrics.last_activity).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentClassView;
