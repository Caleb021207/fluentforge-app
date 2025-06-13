
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Calendar, MapPin, Star, Clock } from "lucide-react";
import { ExtendedUserProfile, StudentEnrollment, StudentGrade } from "@/types/school";
import { getStudentEnrollments, getStudentGrades, calculateGPA } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentProfileProps {
  profile: ExtendedUserProfile;
}

const StudentProfile = ({ profile }: StudentProfileProps) => {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const [enrollmentData, gradeData] = await Promise.all([
          getStudentEnrollments(profile.id),
          getStudentGrades(profile.id)
        ]);
        setEnrollments(enrollmentData);
        setGrades(gradeData);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [profile.id]);

  const gpa = calculateGPA(grades);

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

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{gpa.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Current GPA</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{enrollments.length}</div>
              <p className="text-sm text-muted-foreground">Active Classes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{grades.length}</div>
              <p className="text-sm text-muted-foreground">Recent Grades</p>
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

      {/* Current Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Classes
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
                        <span>{enrollment.class_info?.subject?.name}</span>
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
            <p className="text-muted-foreground text-center py-8">No classes enrolled</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
