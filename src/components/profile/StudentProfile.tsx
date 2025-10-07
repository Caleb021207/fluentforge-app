
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Calendar, MapPin, Star, Clock, User, AlertCircle, MessageSquare, Mic, Volume2 } from "lucide-react";
import { ExtendedUserProfile, StudentEnrollment, StudentGrade, StudentUsageMetrics } from "@/types/school";
import { getStudentEnrollments, getStudentGrades, getStudentUsageMetrics } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import TestScoreCard from "./TestScoreCard";
import { useLocalization } from "@/context/LocalizationContext";

interface StudentProfileProps {
  profile: ExtendedUserProfile;
}

const StudentProfile = ({ profile }: StudentProfileProps) => {
  const { t } = useLocalization();
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
          .select('id, overall_score, cefr_level, reading_score, writing_score, speaking_score, listening_score, upload_date')
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
      {/* Quick Practice Links - Top Priority for Easy Access */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            {t("startPracticing")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("choosePracticeMode")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/practice" className="block">
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <MessageSquare className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="text-center w-full px-2">
                  <div className="font-semibold whitespace-normal break-words">{t("textPractice")}</div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-normal break-words">
                    {t("typeAndChat")}
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link to="/voice-chat" className="block">
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Mic className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="text-center w-full px-2">
                  <div className="font-semibold whitespace-normal break-words">{t("voicePractice")}</div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-normal break-words">
                    {t("speakAndListen")}
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link to="/pronunciation-practice" className="block">
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Volume2 className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="text-center w-full px-2">
                  <div className="font-semibold whitespace-normal break-words">{t("pronunciationPractice")}</div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-normal break-words">
                    {t("improvePronunciation")}
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Test Scores - Second Priority */}
      <TestScoreCard testScore={latestTestScore} />

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {t("studentProfile")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("school")}</p>
              <p className="font-medium">{profile.school?.name || t("notAssigned")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("gradeLevel")}</p>
              <p className="font-medium">{gradeLevel?.level_name || t("notAssigned")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("studentId")}</p>
              <p className="font-medium">{profile.student_id || t("notAssigned")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("graduationYear")}</p>
              <p className="font-medium">{profile.graduation_year || t("notSet")}</p>
            </div>
          </div>
          
          {profile.school?.district && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {profile.school.district}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Performance & Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t("learningActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{enrollments.length}</div>
              <p className="text-sm text-muted-foreground">{t("activeClasses")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPracticeSessions}</div>
              <p className="text-sm text-muted-foreground">{t("practiceSessions")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(totalVoiceChatMinutes)}</div>
              <p className="text-sm text-muted-foreground">{t("voiceChatMinutes")}</p>
            </div>
          </div>

          {grades.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">{t("recentGrades")}</h4>
              <div className="space-y-2">
                {grades.slice(0, 5).map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{grade.assignment?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {grade.assignment?.assignment_type} • {grade.points_earned}/{grade.assignment?.points_possible} {t("points")}
                      </p>
                    </div>
                    <Badge variant={grade.grade_letter === 'A' || grade.grade_letter === 'A+' ? 'default' : 'secondary'}>
                      {grade.grade_letter || t("pending")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Classes with Teacher Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("currentClassesAndTeachers")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="grid gap-4">
              {enrollments.map((enrollment) => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
