
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassAverage {
  class_id: string;
  class_name: string;
  teacher_name: string;
  student_count: number;
  average_score: number | null;
  students_with_scores: number;
}

interface ClassTestAveragesProps {
  schoolId: string;
}

const ClassTestAverages = ({ schoolId }: ClassTestAveragesProps) => {
  const [classAverages, setClassAverages] = useState<ClassAverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolAverage, setSchoolAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchClassAverages = async () => {
      setIsLoading(true);
      try {
        // Get all classes in the school
        const { data: classes } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            teacher:profiles!classes_teacher_id_fkey (
              display_name,
              email
            ),
            student_enrollments (
              student_id
            )
          `)
          .eq('school_id', schoolId);

        if (!classes) return;

        const classAveragePromises = classes.map(async (classData) => {
          const studentIds = classData.student_enrollments.map(e => e.student_id);
          
          if (studentIds.length === 0) {
            return {
              class_id: classData.id,
              class_name: classData.name,
              teacher_name: classData.teacher?.display_name || classData.teacher?.email || 'Unknown',
              student_count: 0,
              average_score: null,
              students_with_scores: 0
            };
          }

          // Get latest transcript analysis for each student in the class
          const scorePromises = studentIds.map(async (studentId) => {
            const { data: latestAnalysis } = await supabase
              .from('transcript_analyses')
              .select('overall_score')
              .eq('user_id', studentId)
              .order('upload_date', { ascending: false })
              .limit(1)
              .maybeSingle();

            return latestAnalysis?.overall_score || null;
          });

          const scores = await Promise.all(scorePromises);
          const validScores = scores.filter(score => score !== null) as number[];
          
          const average = validScores.length > 0 
            ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
            : null;

          return {
            class_id: classData.id,
            class_name: classData.name,
            teacher_name: classData.teacher?.display_name || classData.teacher?.email || 'Unknown',
            student_count: studentIds.length,
            average_score: average,
            students_with_scores: validScores.length
          };
        });

        const averages = await Promise.all(classAveragePromises);
        setClassAverages(averages);

        // Calculate school average
        const classesWithScores = averages.filter(c => c.average_score !== null);
        if (classesWithScores.length > 0) {
          const schoolAvg = classesWithScores.reduce((sum, c) => sum + (c.average_score || 0), 0) / classesWithScores.length;
          setSchoolAverage(Math.round(schoolAvg));
        }
      } catch (error) {
        console.error('Error fetching class averages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassAverages();
  }, [schoolId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Class Test Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Class Test Averages
        </CardTitle>
        {schoolAverage !== null && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              School Average: <span className="font-semibold text-primary">{schoolAverage}%</span>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {classAverages.length > 0 ? (
          <div className="space-y-3">
            {classAverages
              .sort((a, b) => (b.average_score || 0) - (a.average_score || 0))
              .map((classAvg) => (
              <div key={classAvg.class_id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{classAvg.class_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Teacher: {classAvg.teacher_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {classAvg.students_with_scores} of {classAvg.student_count} students tested
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {classAvg.average_score ? `${Math.round(classAvg.average_score)}%` : 'No scores'}
                    </div>
                    {classAvg.students_with_scores > 0 && (
                      <Badge variant="outline">
                        {Math.round((classAvg.students_with_scores / classAvg.student_count) * 100)}% tested
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No classes found in this school
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassTestAverages;
