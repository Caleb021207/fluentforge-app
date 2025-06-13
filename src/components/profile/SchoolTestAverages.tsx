
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SchoolAverage {
  school_id: string;
  school_name: string;
  student_count: number;
  students_with_scores: number;
  average_score: number | null;
  class_count: number;
}

interface SchoolTestAveragesProps {
  userId: string;
}

const SchoolTestAverages = ({ userId }: SchoolTestAveragesProps) => {
  const [schoolAverages, setSchoolAverages] = useState<SchoolAverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [districtAverage, setDistrictAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchSchoolAverages = async () => {
      setIsLoading(true);
      try {
        // Get all districts this user administers
        const { data: districtUsers } = await supabase
          .from('district_users')
          .select('district_id')
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (!districtUsers || districtUsers.length === 0) return;

        const districtIds = districtUsers.map(du => du.district_id);

        // Get all schools in these districts
        const { data: schools } = await supabase
          .from('schools')
          .select(`
            id,
            name,
            classes (
              id,
              student_enrollments (
                student_id
              )
            )
          `)
          .in('district_id', districtIds);

        if (!schools) return;

        const schoolAveragePromises = schools.map(async (school) => {
          const allStudentIds = school.classes.flatMap(c => 
            c.student_enrollments.map(e => e.student_id)
          );
          const uniqueStudentIds = [...new Set(allStudentIds)];

          if (uniqueStudentIds.length === 0) {
            return {
              school_id: school.id,
              school_name: school.name,
              student_count: 0,
              students_with_scores: 0,
              average_score: null,
              class_count: school.classes.length
            };
          }

          // Get latest transcript analysis for each student
          const scorePromises = uniqueStudentIds.map(async (studentId) => {
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
            school_id: school.id,
            school_name: school.name,
            student_count: uniqueStudentIds.length,
            students_with_scores: validScores.length,
            average_score: average,
            class_count: school.classes.length
          };
        });

        const averages = await Promise.all(schoolAveragePromises);
        setSchoolAverages(averages);

        // Calculate district average
        const schoolsWithScores = averages.filter(s => s.average_score !== null);
        if (schoolsWithScores.length > 0) {
          const districtAvg = schoolsWithScores.reduce((sum, s) => sum + (s.average_score || 0), 0) / schoolsWithScores.length;
          setDistrictAverage(Math.round(districtAvg));
        }
      } catch (error) {
        console.error('Error fetching school averages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolAverages();
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Test Averages
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
          <Building2 className="h-5 w-5" />
          School Test Averages
        </CardTitle>
        {districtAverage !== null && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              District Average: <span className="font-semibold text-primary">{districtAverage}%</span>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {schoolAverages.length > 0 ? (
          <div className="space-y-3">
            {schoolAverages
              .sort((a, b) => (b.average_score || 0) - (a.average_score || 0))
              .map((schoolAvg, index) => (
              <div key={schoolAvg.school_id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {schoolAvg.school_name}
                        {index === 0 && schoolAverages.length > 1 && schoolAvg.average_score && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {schoolAvg.class_count} classes • {schoolAvg.student_count} students
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {schoolAvg.students_with_scores} students tested
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {schoolAvg.average_score ? `${Math.round(schoolAvg.average_score)}%` : 'No scores'}
                    </div>
                    {schoolAvg.students_with_scores > 0 && (
                      <Badge variant="outline">
                        {Math.round((schoolAvg.students_with_scores / schoolAvg.student_count) * 100)}% tested
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No schools found in your district
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolTestAverages;
