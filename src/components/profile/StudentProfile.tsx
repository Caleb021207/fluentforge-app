
import { useState, useEffect } from "react";
import { InteractiveCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Mic, Sparkles, BookOpen } from "lucide-react";
import { ExtendedUserProfile, StudentEnrollment, StudentGrade, StudentUsageMetrics } from "@/types/school";
import { getStudentEnrollments, getStudentGrades, getStudentUsageMetrics } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { LeaderboardSection } from "./LeaderboardSection";

interface StudentProfileProps {
  profile: ExtendedUserProfile;
}

const StudentProfile = ({ profile }: StudentProfileProps) => {
  const { t } = useLocalization();
  const { usageLimits, premiumVoiceMinutesRemaining } = useUsageLimits();
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<StudentUsageMetrics[]>([]);
  const [latestTestScore, setLatestTestScore] = useState<any>(null);
  const [gradeLevel, setGradeLevel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching student data for:', profile.id);

        const [enrollmentData, gradeData, usageData] = await Promise.all([
          getStudentEnrollments(profile.id),
          getStudentGrades(profile.id),
          getStudentUsageMetrics(profile.id)
        ]);

        console.log('Student data loaded:', {
          enrollments: enrollmentData?.length || 0,
          grades: gradeData?.length || 0,
          usage: usageData?.length || 0
        });

        setEnrollments(enrollmentData || []);
        setGrades(gradeData || []);
        setUsageMetrics(usageData || []);

        // Fetch grade level if grade_level_id exists
        if (profile.grade_level_id) {
          const { data: gradeLevelData } = await supabase
            .from('grade_levels')
            .select('*')
            .eq('id', profile.grade_level_id)
            .single();
          
          setGradeLevel(gradeLevelData);
        }

        // Fetch most recent transcript analysis
        const { data: latestAnalysis } = await supabase
          .from('transcript_analyses')
          .select('id, overall_score, cefr_level, upload_date, reading_listening_score, written_production_score, spoken_fluency_score')
          .eq('user_id', profile.id)
          .order('upload_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        setLatestTestScore(latestAnalysis);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();

    // Set up real-time subscription for enrollment changes
    const enrollmentChannel = supabase
      .channel('student_enrollment_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_enrollments',
          filter: `student_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Enrollment changed, refetching data:', payload);
          fetchStudentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(enrollmentChannel);
    };
  }, [profile.id, profile.grade_level_id]);

  const totalPracticeSessions = usageMetrics.reduce((sum, metric) => sum + metric.practice_sessions, 0);
  const totalVoiceChatMinutes = usageMetrics.reduce((sum, metric) => sum + metric.voice_chat_minutes, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leaderboard Section */}
      <LeaderboardSection />

      {/* Monthly Usage Limits */}
      <InteractiveCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("monthlyUsageLimits") || "Monthly Usage Limits"}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="h-5 w-5 text-primary" />
                <h4 className="font-medium">{t("voicePractice") || "Voice Practice"}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("minutesRemaining") || "Minutes Remaining"}</span>
                  <span className="text-lg font-bold text-primary">
                    {usageLimits?.voiceMinutesRemaining || 0} / {usageLimits?.voiceMinutesLimit || 100}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${((usageLimits?.voiceMinutesRemaining || 0) / (usageLimits?.voiceMinutesLimit || 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-medium">{t("premiumVoicePractice") || "Premium Voice Practice"}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("minutesRemaining") || "Minutes Remaining"}</span>
                  <span className="text-lg font-bold text-primary">
                    {premiumVoiceMinutesRemaining} / 15
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${(premiumVoiceMinutesRemaining / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </InteractiveCard>

      {/* Current Classes with Teacher Info */}
      <InteractiveCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("currentClassesAndTeachers")}</h3>
          </div>
          {enrollments.length > 0 ? (
            <div className="grid gap-4">
              {enrollments.slice(0, 1).map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{enrollment.class_info?.name || t("unnamedClass")}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{enrollment.class_info?.subject?.name || t("noSubject")}</span>
                        {enrollment.class_info?.period && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {enrollment.class_info.period}
                          </span>
                        )}
                        {enrollment.class_info?.room_number && (
                          <span>{enrollment.class_info.room_number}</span>
                        )}
                      </div>
                      {(enrollment.class_info as any)?.teacher && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3" />
                          <span className="font-medium">
                            {t("teacher")}: {(enrollment.class_info as any).teacher.display_name || (enrollment.class_info as any).teacher.email}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{enrollment.class_info?.class_code || t("noCode")}</Badge>
                        <Badge variant="secondary">{enrollment.class_info?.academic_year || t("currentYear")}</Badge>
                      </div>
                    </div>
                    {enrollment.final_grade && (
                      <Badge>{enrollment.final_grade}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="space-y-3">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">{t("noClassesYet")}</h3>
                <p className="text-muted-foreground">{t("haventJoinedClasses")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("askTeacherForClassCode")}
                </p>
              </div>
            </div>
          )}
        </div>
      </InteractiveCard>
    </div>
  );
};

export default StudentProfile;
