
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, Calendar, MapPin } from "lucide-react";
import { ExtendedUserProfile, ClassInfo } from "@/types/school";
import { getTeacherClasses } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherProfileProps {
  profile: ExtendedUserProfile;
}

const TeacherProfile = ({ profile }: TeacherProfileProps) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setIsLoading(true);
      try {
        const classData = await getTeacherClasses(profile.id);
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [profile.id]);

  const currentYearClasses = classes.filter(c => c.academic_year === '2024-2025');
  const uniqueSubjects = [...new Set(classes.map(c => c.subject?.name).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teacher Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teacher Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">School</p>
              <p className="font-medium">{profile.school?.name || 'Not assigned'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="default">Teacher</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">
                {uniqueSubjects.length > 0 ? uniqueSubjects.join(', ') : 'Not assigned'}
              </p>
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

      {/* Teaching Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teaching Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentYearClasses.length}</div>
              <p className="text-sm text-muted-foreground">Current Classes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{uniqueSubjects.length}</div>
              <p className="text-sm text-muted-foreground">Subjects Teaching</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {currentYearClasses.reduce((total, c) => total + (c.max_students || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Student Capacity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Classes ({currentYearClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentYearClasses.length > 0 ? (
            <div className="grid gap-4">
              {currentYearClasses.map((classInfo) => (
                <div key={classInfo.id} className="border rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{classInfo.name}</h4>
                        <p className="text-sm text-muted-foreground">{classInfo.subject?.name}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{classInfo.period}</p>
                        {classInfo.room_number && <p>Room {classInfo.room_number}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{classInfo.class_code}</Badge>
                      <Badge variant="secondary">{classInfo.academic_year}</Badge>
                      {classInfo.semester && (
                        <Badge variant="outline">{classInfo.semester}</Badge>
                      )}
                      {classInfo.grade_level && (
                        <Badge variant="outline">{classInfo.grade_level.level_name}</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Max Students: {classInfo.max_students}
                      </span>
                      <span className="text-muted-foreground">
                        {classInfo.subject?.department}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No classes assigned for current year</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfile;
