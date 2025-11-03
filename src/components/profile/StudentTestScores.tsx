
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar, AlertCircle, CheckCircle, BarChart, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCEFRColor } from "@/components/transcript-analysis/utils/cefrUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RemoveStudentDialog } from "@/components/classroom/components/RemoveStudentDialog";

interface StudentMetrics {
  student_id: string;
  student_name: string;
  student_email: string;
  class_id: string;
  class_name: string;
  // Test scores
  overall_score: number | null;
  cefr_level: string | null;
  upload_date: string | null;
  // Language metrics
  avg_grammar_accuracy: number | null;
  avg_conversation_complexity: number | null;
  last_activity: string | null;
}

interface ClassAverages {
  overall_score: number | null;
  grammar_accuracy: number | null;
  conversation_complexity: number | null;
  total_students: number;
  students_with_scores: number;
}

interface StudentTestScoresProps {
  teacherId: string;
  onDataUpdate?: (average: number | null, studentCount: number) => void;
}

const StudentTestScores = ({ teacherId, onDataUpdate }: StudentTestScoresProps) => {
  const [studentMetrics, setStudentMetrics] = useState<StudentMetrics[]>([]);
  const [classAverages, setClassAverages] = useState<ClassAverages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; classId: string } | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching comprehensive student data for teacher:', teacherId);

        // Get teacher's classes
        const { data: rawClasses, error: classError } = await supabase
          .from('classes')
          .select('id, name, class_code, academic_year')
          .eq('teacher_id', teacherId);

        console.log('Teacher classes:', rawClasses);
        console.log('Class fetch error:', classError);

        if (!rawClasses || rawClasses.length === 0) {
          console.log('No classes assigned to this teacher');
          setStudentMetrics([]);
          setIsLoading(false);
          setDebugInfo({ teacherClasses: 0, totalEnrollments: 0 });
          return;
        }

        // Get all student enrollments for these classes
        const classIds = rawClasses.map(c => c.id);
        const { data: enrollments, error: enrollError } = await supabase
          .from('student_enrollments')
          .select('student_id, class_id, status')
          .in('class_id', classIds)
          .eq('status', 'active');

        console.log('Student enrollments:', enrollments);
        console.log('Enrollment fetch error:', enrollError);

        if (!enrollments || enrollments.length === 0) {
          console.log('No students enrolled in classes');
          setStudentMetrics([]);
          setIsLoading(false);
          setDebugInfo({ teacherClasses: rawClasses.length, totalEnrollments: 0 });
          return;
        }

        // Get student profiles
        const studentIds = [...new Set(enrollments.map(e => e.student_id))];
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', studentIds);

        console.log('Student profiles:', profiles);
        console.log('Profile fetch error:', profileError);

        // Create a map for easy lookup
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const enrollmentsByClass = new Map();
        
        enrollments.forEach(e => {
          if (!enrollmentsByClass.has(e.class_id)) {
            enrollmentsByClass.set(e.class_id, []);
          }
          enrollmentsByClass.get(e.class_id).push({
            student_id: e.student_id,
            profiles: profileMap.get(e.student_id)
          });
        });

        // Attach enrollments to classes with proper typing
        const teacherClasses = rawClasses.map(cls => ({
          ...cls,
          student_enrollments: enrollmentsByClass.get(cls.id) || []
        }));


        setDebugInfo({
          teacherClasses: teacherClasses.length,
          totalEnrollments: teacherClasses.reduce((sum, cls) => sum + (cls.student_enrollments?.length || 0), 0)
        });

        // Collect all student data
        const allStudentMetrics: StudentMetrics[] = [];
        
        for (const classData of teacherClasses) {
          if (!classData.student_enrollments || classData.student_enrollments.length === 0) {
            continue;
          }

          for (const enrollment of classData.student_enrollments) {
            const studentId = enrollment.student_id;

            // Get test scores from transcript_analyses
            const { data: latestAnalysis } = await supabase
              .from('transcript_analyses')
              .select('overall_score, cefr_level, upload_date')
              .eq('user_id', studentId)
              .order('upload_date', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get language metrics
            const { data: languageMetrics } = await supabase
              .from('student_metrics')
              .select('avg_grammar_accuracy, avg_conversation_complexity')
              .eq('student_id', studentId)
              .maybeSingle();

            // Get last login time from auth.users
            const { data: lastSignIn } = await supabase
              .rpc('get_user_last_sign_in', { user_id: studentId });

            allStudentMetrics.push({
              student_id: studentId,
              student_name: (enrollment as any).profiles?.display_name || (enrollment as any).profiles?.email || 'Unknown',
              student_email: (enrollment as any).profiles?.email || '',
              class_id: classData.id,
              class_name: classData.name,
              overall_score: latestAnalysis?.overall_score || null,
              cefr_level: latestAnalysis?.cefr_level || null,
              upload_date: latestAnalysis?.upload_date || null,
              avg_grammar_accuracy: languageMetrics?.avg_grammar_accuracy || null,
              avg_conversation_complexity: languageMetrics?.avg_conversation_complexity || null,
              last_activity: lastSignIn || null
            });
          }
        }

        console.log('All student metrics:', allStudentMetrics);
        setStudentMetrics(allStudentMetrics);

        // Calculate class averages
        const studentsWithScores = allStudentMetrics.filter(s => s.overall_score !== null);
        const studentsWithGrammar = allStudentMetrics.filter(s => s.avg_grammar_accuracy !== null);
        const studentsWithComplexity = allStudentMetrics.filter(s => s.avg_conversation_complexity !== null);

        const averages: ClassAverages = {
          overall_score: studentsWithScores.length > 0
            ? studentsWithScores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / studentsWithScores.length
            : null,
          grammar_accuracy: studentsWithGrammar.length > 0
            ? studentsWithGrammar.reduce((sum, s) => sum + (s.avg_grammar_accuracy || 0), 0) / studentsWithGrammar.length
            : null,
          conversation_complexity: studentsWithComplexity.length > 0
            ? studentsWithComplexity.reduce((sum, s) => sum + (s.avg_conversation_complexity || 0), 0) / studentsWithComplexity.length
            : null,
          total_students: allStudentMetrics.length,
          students_with_scores: studentsWithScores.length
        };

        setClassAverages(averages);

        // Update parent component
        if (onDataUpdate) {
          onDataUpdate(
            averages.overall_score ? Math.round(averages.overall_score) : null,
            allStudentMetrics.length
          );
        }

      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [teacherId, onDataUpdate]);

  const handleRemoveClick = (studentId: string, studentName: string, classId: string) => {
    setSelectedStudent({ id: studentId, name: studentName, classId });
    setRemoveDialogOpen(true);
  };

  const handleRemoveSuccess = async () => {
    // Close dialog and clear selection
    setRemoveDialogOpen(false);
    setSelectedStudent(null);
    
    // Refetch the data
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        // Force a fresh fetch by calling the same logic
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            class_code,
            academic_year,
            student_enrollments!inner (
              student_id,
              profiles:student_id (
                id,
                display_name,
                email
              )
            )
          `)
          .eq('teacher_id', teacherId);

        // Process the data the same way
        if (teacherClasses && teacherClasses.length > 0) {
          const allStudentMetrics: StudentMetrics[] = [];
          
          for (const classData of teacherClasses) {
            if (!classData.student_enrollments || classData.student_enrollments.length === 0) {
              continue;
            }

            for (const enrollment of classData.student_enrollments) {
              const studentId = enrollment.student_id;

              const { data: latestAnalysis } = await supabase
                .from('transcript_analyses')
                .select('overall_score, cefr_level, upload_date')
                .eq('user_id', studentId)
                .order('upload_date', { ascending: false })
                .limit(1)
                .maybeSingle();

              const { data: languageMetrics } = await supabase
                .from('student_metrics')
                .select('avg_grammar_accuracy, avg_conversation_complexity')
                .eq('student_id', studentId)
                .maybeSingle();

              const { data: lastSignIn } = await supabase
                .rpc('get_user_last_sign_in', { user_id: studentId });

              allStudentMetrics.push({
                student_id: studentId,
                student_name: (enrollment as any).profiles?.display_name || (enrollment as any).profiles?.email || 'Unknown',
                student_email: (enrollment as any).profiles?.email || '',
                class_id: classData.id,
                class_name: classData.name,
                overall_score: latestAnalysis?.overall_score || null,
                cefr_level: latestAnalysis?.cefr_level || null,
                upload_date: latestAnalysis?.upload_date || null,
                avg_grammar_accuracy: languageMetrics?.avg_grammar_accuracy || null,
                avg_conversation_complexity: languageMetrics?.avg_conversation_complexity || null,
                last_activity: lastSignIn || null
              });
            }
          }

          setStudentMetrics(allStudentMetrics);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No activity';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A';
    return `${Math.round(score)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Roster & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Roster Table */}
      <Card className="glass border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Student Roster & Performance
          </CardTitle>
          {debugInfo && (
            <div className="text-sm text-muted-foreground">
              {debugInfo.teacherClasses} class(es) • {debugInfo.totalEnrollments} student(s)
            </div>
          )}
        </CardHeader>
        <CardContent className="relative z-10">
          {studentMetrics.length > 0 ? (
            <div className="rounded-lg border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Class</TableHead>
                    <TableHead className="text-right font-semibold">Test Score</TableHead>
                    <TableHead className="text-right font-semibold">Grammar</TableHead>
                    <TableHead className="text-right font-semibold">Complexity</TableHead>
                    <TableHead className="font-semibold">Last Activity</TableHead>
                    <TableHead className="text-center w-20 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentMetrics
                    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
                    .map((student, index) => (
                    <TableRow 
                      key={student.student_id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-semibold text-primary">
                            {student.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{student.student_name}</div>
                            <div className="text-sm text-muted-foreground">{student.student_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">
                          {student.class_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-lg text-foreground">{formatScore(student.overall_score)}</span>
                          {student.cefr_level && (
                            <Badge className={getCEFRColor(student.cefr_level)} variant="outline">
                              {student.cefr_level}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-foreground">{formatScore(student.avg_grammar_accuracy)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-foreground">{formatScore(student.avg_conversation_complexity)}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(student.last_activity)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveClick(student.student_id, student.student_name, student.class_id)}
                          className="h-8 w-8 p-0 border-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">
                No students enrolled yet
              </p>
              <p className="text-sm text-muted-foreground">
                Students need to join your classes using class access codes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Student Dialog */}
      {selectedStudent && (
        <RemoveStudentDialog
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          classId={selectedStudent.classId}
          onRemoved={handleRemoveSuccess}
        />
      )}
    </div>
  );
};

export default StudentTestScores;
