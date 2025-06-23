
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Users, TrendingUp, Award } from "lucide-react";
import { ExtendedUserProfile, DistrictSchoolData } from "@/types/school";
import { getDistrictSchoolsData } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import CodeManagement from "@/components/admin/CodeManagement";
import SchoolTestAverages from "./SchoolTestAverages";
import { useLocalization } from "@/context/LocalizationContext";

interface DistrictProfileProps {
  profile: ExtendedUserProfile;
}

const DistrictProfile = ({ profile }: DistrictProfileProps) => {
  const { t } = useLocalization();
  const [schoolsData, setSchoolsData] = useState<DistrictSchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDistrictData = async () => {
      setIsLoading(true);
      try {
        console.log('DistrictProfile: Fetching data for user:', profile.id, 'role:', profile.role);
        const data = await getDistrictSchoolsData(profile.id);
        console.log('DistrictProfile: Received data:', data);
        setSchoolsData(data);
      } catch (error) {
        console.error('Error fetching district data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistrictData();
  }, [profile.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalStudents = schoolsData.reduce((sum, school) => sum + school.total_students, 0);
  const totalClasses = schoolsData.reduce((sum, school) => sum + school.total_classes, 0);
  const overallAvgScore = schoolsData.length > 0
    ? schoolsData.reduce((sum, school) => sum + school.avg_certification_score, 0) / schoolsData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* School Test Averages - Top Priority */}
      <SchoolTestAverages userId={profile.id} />

      {/* Access Code Management */}
      <CodeManagement userRole="district" />

      {/* District Administrator Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("districtAdministratorProfile")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("role")}</p>
              <Badge variant="default">{t("districtAdministrator")}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("schoolsManaged")}</p>
              <p className="font-medium">{schoolsData.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("totalStudents")}</p>
              <p className="font-medium">{totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* District Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("districtOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{schoolsData.length}</div>
              <p className="text-sm text-muted-foreground">{t("schools")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalClasses}</div>
              <p className="text-sm text-muted-foreground">{t("totalClasses")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalStudents.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">{t("totalStudents")}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overallAvgScore.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">{t("districtAvgScore")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("schoolsPerformance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schoolsData.length > 0 ? (
            <div className="space-y-4">
              {schoolsData
                .sort((a, b) => b.avg_certification_score - a.avg_certification_score)
                .map((schoolData, index) => (
                <div key={schoolData.school.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{schoolData.school.name}</h4>
                        {index === 0 && schoolsData.length > 1 && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schoolData.total_students} {t("students")} • {schoolData.total_classes} {t("classes")}
                      </p>
                      {schoolData.school.principal_name && (
                        <p className="text-sm text-muted-foreground">
                          {t("principal")}: {schoolData.school.principal_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {schoolData.avg_certification_score.toFixed(1)}
                      </div>
                      <p className="text-sm text-muted-foreground">{t("avgScore")}</p>
                    </div>
                  </div>
                  
                  {schoolData.certification_stats.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {schoolData.certification_stats.map((stat) => (
                        <Badge key={stat.id} variant="outline" className="text-xs">
                          {stat.certification_type.replace('_', ' ')}: {stat.avg_score?.toFixed(1)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("noSchoolsFoundInDistrict")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DistrictProfile;
