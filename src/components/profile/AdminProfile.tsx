
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, BookOpen, GraduationCap, BarChart3, TrendingUp, Clock } from "lucide-react";
import { ExtendedUserProfile, AdminSchoolData, TeacherClassData } from "@/types/school";
import { getAdminSchoolData, getSchoolClassroomData } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import CodeManagement from "@/components/admin/CodeManagement";
import ClassTestAverages from "./ClassTestAverages";
import { useLocalization } from "@/context/LocalizationContext";

interface AdminProfileProps {
  profile: ExtendedUserProfile;
}

const AdminProfile = ({ profile }: AdminProfileProps) => {
  const { t } = useLocalization();
  const [schoolData, setSchoolData] = useState<AdminSchoolData | null>(null);
  const [classroomData, setClassroomData] = useState<TeacherClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const [schoolResult, classroomResult] = await Promise.all([
          getAdminSchoolData(profile.id),
          getSchoolClassroomData(profile.id)
        ]);
        setSchoolData(schoolResult);
        setClassroomData(classroomResult);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [profile.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">{t("schoolDataNotAvailable")}</h3>
        <p className="text-muted-foreground">
          {t("unableToLoadSchoolData")}
        </p>
      </div>
    );
  }

  const averageCertScore = schoolData.avg_certification_score;
  const totalEnrollments = schoolData.total_students;

  return (
    <div className="space-y-6">
      {/* Class Test Averages - Top Priority */}
      {profile.school_id && <ClassTestAverages schoolId={profile.school_id} />}

      {/* Access Code Management */}
      <CodeManagement userRole="admin" userSchool={schoolData.school.name} />

      {/* Administrator Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t("schoolAdministratorProfile")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("school")}</p>
              <p className="font-medium">{schoolData.school.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("role")}</p>
              <Badge variant="default">{t("administrator")}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("district")}</p>
              <p className="font-medium">{schoolData.school.district || t("notAssigned")}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("schoolAddress")}</p>
              <p className="text-sm">{schoolData.school.address || t("notProvided")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("principal")}</p>
              <p className="text-sm">{schoolData.school.principal_name || t("notAssigned")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("schoolOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{schoolData.total_classes}</div>
              <p className="text-sm text-muted-foreground">{t("totalClasses")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{schoolData.total_teachers}</div>
              <p className="text-sm text-muted-foreground">{t("teachers")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalEnrollments}</div>
              <p className="text-sm text-muted-foreground">{t("enrollments")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{averageCertScore.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">{t("avgCertScore")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classroom Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("classroomManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classroomData.length > 0 ? (
            <div className="space-y-4">
              {classroomData.map((classroom) => (
                <div key={classroom.class_info.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{classroom.class_info.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {classroom.class_info.subject?.name} • {classroom.class_info.period || t("noPeriodAssigned")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{classroom.enrollment_count}</div>
                      <p className="text-sm text-muted-foreground">{t("students")}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{t("teacher")}: {classroom.class_info.teacher?.display_name || t("notAssigned")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{t("room")}: {classroom.class_info.room_number || t("tbd")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{classroom.class_info.academic_year}</Badge>
                      {classroom.class_info.semester && (
                        <Badge variant="outline">{classroom.class_info.semester}</Badge>
                      )}
                    </div>
                  </div>
                  {classroom.certification_stats.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium">{t("certificationPerformance")}:</p>
                      <div className="flex gap-2 mt-1">
                        {classroom.certification_stats.map((stat) => (
                          <Badge key={stat.id} variant="secondary" className="text-xs">
                            {stat.certification_type}: {stat.avg_score?.toFixed(1) || 'N/A'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noClassesFoundInSchool")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Certification Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {t("schoolCertificationPerformance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schoolData.certification_stats.length > 0 ? (
            <div className="space-y-4">
              {schoolData.certification_stats.map((stat) => (
                <div key={stat.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium capitalize">{stat.certification_type.replace('_', ' ')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {stat.student_count} {t("students")} • {stat.class_count} {t("classes")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.avg_score?.toFixed(1) || 'N/A'}</div>
                      <p className="text-sm text-muted-foreground">{t("averageScore")}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline">{stat.academic_year}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noCertificationDataAvailable")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
