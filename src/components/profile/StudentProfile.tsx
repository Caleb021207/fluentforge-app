
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Calendar, MapPin, Star, Clock, User, AlertCircle } from "lucide-react";
import { ExtendedUserProfile, StudentEnrollment, StudentGrade, StudentUsageMetrics } from "@/types/school";
import { getStudentEnrollments, getStudentGrades, getStudentUsageMetrics } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import TestScoreCard from "./TestScoreCard";

interface StudentProfileProps {
  profile: ExtendedUserProfile;
}

const StudentProfile = ({ profile }: StudentProfileProps) => {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<StudentUsageMetrics[]>([]);
  const [latestTestScore, setLatestTestScore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching student data for:', profile.id);

        // Debug: Check raw student_enrollments table
        const { data: rawEnrollments } = await supabase
          .from('student_enrollments')
          .select('*')
          .eq('student_id', profile.id);

        console.log('Raw enrollments:', rawEnrollments);

        // Debug: Check what classes exist and their teacher assignments
        const { data: allClasses } = await supabase
          .from('classes')
          .select(`
            id, 
            name, 
            class_code, 
            teacher_id,
            teacher:profiles!classes_teacher_id_fkey (
              display_name,
              email
            )
          `)
          .limit(10);

        console.log('All classes in system:', allClasses);

        const [enrollmentData, gradeData, usageData] = await Promise.all([
          getStudentEnrollments(profile.id),
          getStudentGrades(profile.id),
          getStudentUsageMetrics(profile.id)
        ]);

        console.log('Processed enrollment data:', enrollmentData);
        console.log('Grade data:', gradeData);
        console.log('Usage data:', usageData);

        setEnrollments(enrollmentData);
        setGrades(gradeData);
        setUsageMetrics(usageData);

        setDebugInfo({
          rawEnrollments: rawEnrollments?.length || 0,
          processedEnrollments: enrollmentData?.length || 0,
          allClassesCount: allClasses?.length || 0,
          classesWithTeachers: allClasses?.filter(c => c.teacher_id)?.length || 0,
          studentId: profile.id
        });

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
  }, [profile.id]);

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
      {/* Test Scores - Top Priority */}
      <TestScoreCard testScore={latestTestScore} />

      {/* Debug Information for Enrollment Issues */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <AlertCircle className="h-5 w-5" />
              Class Enrollment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>Student ID: {debugInfo.studentId}</p>
              <p>Raw enrollments found: {debugInfo.rawEnrollments}</p>
              <p>Processed enrollments: {debugInfo.processedEnrollments}</p>
              <p>Total classes in system: {debugInfo.allClassesCount}</p>
              <p>Classes with assigned teachers: {debugInfo.classesWithTeachers}</p>
              {enrollments.length > 0 ? (
                <p className="text-green-700 font-medium">✅ Enrollment data found and processed successfully!</p>
              ) : (
                <p className="text-yellow-700">
                  {debugInfo.rawEnrollments > 0 
                    ? "Enrollments exist but there may be an issue with teacher assignments or data processing."
                    : "No enrollments found. You may need to use a class code to join a class."
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">School</p>
              <p className="font-medium">{profile.school?.name || 'Not assigned'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Grade Level</p>
              <p className="font-medium">{profile.grade_level?.level_name || 'Not assigned'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium">{profile.student_id || 'Not assigned'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Graduation Year</p>
              <p className="font-medium">{profile.graduation_year || 'Not set'}</p>
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
            Learning Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{enrollments.length}</div>
              <p className="text-sm text-muted-foreground">Active Classes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPracticeSessions}</div>
              <p className="text-sm text-muted-foreground">Practice Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(totalVoiceChatMinutes)}</div>
              <p className="text-sm text-muted-foreground">Voice Chat Minutes</p>
            </div>
          </div>

          {grades.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Grades</h4>
              <div className="space-y-2">
                {grades.slice(0, 5).map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{grade.assignment?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {grade.assignment?.assignment_type} • {grade.points_earned}/{grade.assignment?.points_possible} points
                      </p>
                    </div>
                    <Badge variant={grade.grade_letter === 'A' || grade.grade_letter === 'A+' ? 'default' : 'secondary'}>
                      {grade.grade_letter || 'Pending'}
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
            Current Classes & Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="grid gap-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{enrollment.class_info?.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{enrollment.class_info?.subject?.name || 'Subject not assigned'}</span>
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
                            Teacher: {(enrollment.class_info as any).teacher.display_name || (enrollment.class_info as any).teacher.email}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{enrollment.class_info?.class_code}</Badge>
                        <Badge variant="secondary">{enrollment.class_info?.academic_year}</Badge>
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
              <p className="text-muted-foreground">No classes enrolled</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check the enrollment status above for more details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
