
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, BookOpen, GraduationCap, BarChart3, TrendingUp } from "lucide-react";
import { ExtendedUserProfile, AdminSchoolData } from "@/types/school";
import { getAdminSchoolData } from "@/utils/schoolUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminProfileProps {
  profile: ExtendedUserProfile;
}

const AdminProfile = ({ profile }: AdminProfileProps) => {
  const [schoolData, setSchoolData] = useState<AdminSchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminSchoolData(profile.id);
        setSchoolData(data);
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
        <h3 className="text-lg font-medium mb-2">School Data Not Available</h3>
        <p className="text-muted-foreground">
          Unable to load school administration data. Please contact support.
        </p>
      </div>
    );
  }

  const averageCertScore = schoolData.certification_stats.length > 0
    ? schoolData.certification_stats.reduce((sum, stat) => sum + (stat.avg_score || 0), 0) / schoolData.certification_stats.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Administrator Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            School Administrator Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">School</p>
              <p className="font-medium">{schoolData.school.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="default">Administrator</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">District</p>
              <p className="font-medium">{schoolData.school.district || 'Not assigned'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">School Address</p>
              <p className="text-sm">{schoolData.school.address || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Principal</p>
              <p className="text-sm">{schoolData.school.principal_name || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            School Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{schoolData.total_classes}</div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{schoolData.total_teachers}</div>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{schoolData.total_students}</div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{averageCertScore.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Avg Cert Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certification Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Certification Performance
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
                        {stat.student_count} students • {stat.class_count} classes
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.avg_score?.toFixed(1) || 'N/A'}</div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
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
              No certification data available yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
