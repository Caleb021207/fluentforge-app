
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Users, TrendingUp, Award, AlertTriangle, RefreshCw } from "lucide-react";
import { ExtendedUserProfile, DistrictSchoolData } from "@/types/school";
import { getDistrictSchoolsData } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";
import CodeManagement from "@/components/admin/CodeManagement";
import SchoolTestAverages from "./SchoolTestAverages";
import { useLocalization } from "@/context/LocalizationContext";
import { checkAndFixDistrictPermissions, forceRefreshAuth } from "@/utils/districtPermissionsFixer";
import { useToast } from "@/hooks/use-toast";

interface DistrictProfileProps {
  profile: ExtendedUserProfile;
}

const DistrictProfile = ({ profile }: DistrictProfileProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [schoolsData, setSchoolsData] = useState<DistrictSchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchDistrictData = async () => {
    setIsLoading(true);
    setPermissionError(null);
    
    try {
      console.log('DistrictProfile: Fetching data for user:', profile.id, 'role:', profile.role);
      
      // First check permissions and fix any issues
      const permissionCheck = await checkAndFixDistrictPermissions(profile.id);
      setDebugInfo(permissionCheck);
      
      if (!permissionCheck.success) {
        setPermissionError(permissionCheck.error || 'Permission check failed');
        return;
      }

      // If we fixed permissions, show a success message
      if (permissionCheck.message) {
        toast({
          title: "Permissions Updated",
          description: permissionCheck.message
        });
      }

      // Try to fetch district schools data
      const data = await getDistrictSchoolsData(profile.id);
      console.log('DistrictProfile: Received data:', data);
      setSchoolsData(data);
      
      if (data.length === 0) {
        setPermissionError('No schools found - checking if data needs to be refreshed');
        
        // Wait a moment and try again in case the permissions just got fixed
        setTimeout(async () => {
          const retryData = await getDistrictSchoolsData(profile.id);
          if (retryData.length > 0) {
            setSchoolsData(retryData);
            setPermissionError(null);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error fetching district data:', error);
      setPermissionError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAuth = async () => {
    const result = await forceRefreshAuth();
    if (result.success) {
      toast({
        title: "Success",
        description: "Authentication refreshed successfully"
      });
      // Reload the page after successful refresh
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast({
        title: "Error",
        description: "Failed to refresh authentication",
        variant: "destructive"
      });
    }
  };

  const handleFixPermissions = async () => {
    setIsLoading(true);
    await fetchDistrictData();
  };

  useEffect(() => {
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

  // Show permission error state
  if (permissionError) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Data Access Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              There seems to be an issue accessing district data. This could be due to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Schools not properly linked to your district</li>
              <li>Row Level Security policies need time to take effect</li>
              <li>Authentication session needs refreshing</li>
            </ul>
            
            <div className="bg-muted p-3 rounded text-xs">
              <strong>Error:</strong> {permissionError}
            </div>
            
            {debugInfo && (
              <details className="text-xs">
                <summary className="cursor-pointer">Debug Information</summary>
                <pre className="mt-2 bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleFixPermissions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Fix Permissions & Retry
              </Button>
              <Button onClick={handleRefreshAuth} variant="outline" size="sm">
                Refresh Authentication
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Still show code management even if data access fails */}
        <CodeManagement userRole="district" />
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
