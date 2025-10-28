
import { useState, useEffect } from "react";
import { InteractiveCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, BookOpen } from "lucide-react";
import { ExtendedUserProfile, StudentEnrollment, StudentGrade, StudentUsageMetrics } from "@/types/school";
import { getStudentEnrollments, getStudentGrades, getStudentUsageMetrics } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardSection } from "./LeaderboardSection";
import { getFluencyCertStatus, getCertDisplayName, getCertDisplayDescription } from "@/utils/fluencyCertification";

interface StudentProfileProps {
  profile: ExtendedUserProfile;
}

const StudentProfile = ({ profile }: StudentProfileProps) => {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<StudentUsageMetrics[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<any[]>([]);
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

        // Fetch all transcript analyses for certification status
        const { data: allAnalysesData } = await supabase
          .from('transcript_analyses')
          .select('cefr_level, overall_score')
          .eq('user_id', profile.id)
          .order('upload_date', { ascending: false });

        setAllAnalyses(allAnalysesData || []);
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

  const certStatus = getFluencyCertStatus(allAnalyses);
  const hasCertification = certStatus.level !== null;

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

      {/* Fluency Certification */}
      {hasCertification && (
        <InteractiveCard>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Fluency Certification</h3>
            </div>
            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-bold text-primary">
                  {getCertDisplayName(certStatus.level)}
                </h4>
                <p className="text-muted-foreground">
                  {getCertDisplayDescription(certStatus.level)}
                </p>
              </div>
            </div>
          </div>
        </InteractiveCard>
      )}

      {/* Current Classes with Teacher Info */}
      <InteractiveCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Current Classes & Teachers</h3>
          </div>
          {enrollments.length > 0 ? (
            <div className="grid gap-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{enrollment.class_info?.name || "Unnamed Class"}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{enrollment.class_info?.subject?.name || "No Subject"}</span>
                        {enrollment.class_info?.room_number && (
                          <span>Room: {enrollment.class_info.room_number}</span>
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
                        <Badge variant="outline">{enrollment.class_info?.class_code || "No Code"}</Badge>
                        <Badge variant="secondary">{enrollment.class_info?.academic_year || "Current Year"}</Badge>
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
                <h3 className="text-lg font-medium">No Classes Yet</h3>
                <p className="text-muted-foreground">You haven't joined any classes</p>
                <p className="text-sm text-muted-foreground">
                  Ask your teacher for a class code
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
