
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCEFRColor } from "@/components/transcript-analysis/utils/cefrUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentScore {
  student_id: string;
  student_name: string;
  student_email: string;
  overall_score: number | null;
  cefr_level: string | null;
  upload_date: string | null;
  class_name: string;
}

interface StudentTestScoresProps {
  teacherId: string;
}

const StudentTestScores = ({ teacherId }: StudentTestScoresProps) => {
  const [studentScores, setStudentScores] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classAverage, setClassAverage] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStudentScores = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching data for teacher:', teacherId);

        // First, let's check what classes this teacher has
        const { data: teacherClasses, error: classError } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            student_enrollments!inner (
              student_id,
              profiles!inner (
                id,
                display_name,
                email
              )
            )
          `)
          .eq('teacher_id', teacherId);

        console.log('Teacher classes:', teacherClasses);
        console.log('Class fetch error:', classError);

        // If no classes found, let's check if there are any students with transcript analyses
        // that might not be properly enrolled
        const { data: allStudentAnalyses, error: analysesError } = await supabase
          .from('transcript_analyses')
          .select(`
            user_id,
            overall_score,
            cefr_level,
            upload_date
          `)
          .order('upload_date', { ascending: false });

        console.log('All student analyses:', allStudentAnalyses);

        // Get profile information for users with analyses
        let profilesWithAnalyses: any[] = [];
        if (allStudentAnalyses && allStudentAnalyses.length > 0) {
          const userIds = allStudentAnalyses.map(a => a.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, email, role')
            .in('id', userIds)
            .eq('role', 'student');
          
          profilesWithAnalyses = profiles || [];
        }

        setDebugInfo({
          teacherClasses: teacherClasses?.length || 0,
          totalStudentAnalyses: allStudentAnalyses?.length || 0,
          studentsWithProfiles: profilesWithAnalyses.length,
          classError,
          analysesError
        });

        if (!teacherClasses || teacherClasses.length === 0) {
          // If no classes, show all students with analyses for now (for debugging)
          if (allStudentAnalyses && allStudentAnalyses.length > 0 && profilesWithAnalyses.length > 0) {
            const scores = allStudentAnalyses
              .map(analysis => {
                const profile = profilesWithAnalyses.find(p => p.id === analysis.user_id);
                if (!profile) return null;
                
                return {
                  student_id: analysis.user_id,
                  student_name: profile.display_name || profile.email || 'Unknown',
                  student_email: profile.email || '',
                  overall_score: analysis.overall_score,
                  cefr_level: analysis.cefr_level,
                  upload_date: analysis.upload_date,
                  class_name: 'No Class Assignment'
                };
              })
              .filter(score => score !== null) as StudentScore[];
            
            setStudentScores(scores);
          }
          return;
        }

        const studentScorePromises = teacherClasses.flatMap(classData => 
          classData.student_enrollments.map(async (enrollment) => {
            // Get the most recent transcript analysis for each student
            const { data: latestAnalysis } = await supabase
              .from('transcript_analyses')
              .select('overall_score, cefr_level, upload_date')
              .eq('user_id', enrollment.student_id)
              .order('upload_date', { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              student_id: enrollment.student_id,
              student_name: enrollment.profiles.display_name || enrollment.profiles.email || 'Unknown',
              student_email: enrollment.profiles.email || '',
              overall_score: latestAnalysis?.overall_score || null,
              cefr_level: latestAnalysis?.cefr_level || null,
              upload_date: latestAnalysis?.upload_date || null,
              class_name: classData.name
            };
          })
        );

        const scores = await Promise.all(studentScorePromises);
        setStudentScores(scores);

        // Calculate class average
        const validScores = scores.filter(s => s.overall_score !== null);
        if (validScores.length > 0) {
          const average = validScores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / validScores.length;
          setClassAverage(Math.round(average));
        }
      } catch (error) {
        console.error('Error fetching student scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentScores();
  }, [teacherId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No test taken';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Test Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Test Scores
        </CardTitle>
        {classAverage !== null && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Class Average: <span className="font-semibold text-primary">{classAverage}%</span>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Debug Information */}
        {debugInfo && studentScores.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Debug Information</span>
            </div>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Classes found: {debugInfo.teacherClasses}</p>
              <p>Total student analyses in system: {debugInfo.totalStudentAnalyses}</p>
              <p>Students with profiles: {debugInfo.studentsWithProfiles}</p>
              <p>This suggests students may not be enrolled in your classes yet.</p>
            </div>
          </div>
        )}

        {studentScores.length > 0 ? (
          <div className="space-y-3">
            {studentScores
              .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
              .map((student) => (
              <div key={student.student_id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{student.student_name}</h4>
                    <p className="text-sm text-muted-foreground">{student.student_email}</p>
                    <p className="text-xs text-muted-foreground">{student.class_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold">
                        {student.overall_score ? `${Math.round(student.overall_score)}%` : 'No score'}
                      </div>
                      {student.cefr_level && (
                        <Badge className={getCEFRColor(student.cefr_level)} variant="outline">
                          {student.cefr_level}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(student.upload_date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              No students with test scores found in your classes
            </p>
            <p className="text-sm text-muted-foreground">
              Students need to join your classes using class access codes and upload transcripts for AI analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentTestScores;
