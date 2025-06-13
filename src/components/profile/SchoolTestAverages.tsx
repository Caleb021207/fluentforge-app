import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, TrendingUp } from "lucide-react";
import { getDistrictSchoolsData } from "@/utils/schoolUtils";
import { DistrictSchoolData } from "@/types/school";

interface SchoolTestAveragesProps {
  userId: string;
}

const SchoolTestAverages = ({ userId }: SchoolTestAveragesProps) => {
  const [schoolsData, setSchoolsData] = useState<DistrictSchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolAverages = async () => {
      setIsLoading(true);
      try {
        console.log('SchoolTestAverages: Fetching data for user:', userId);
        const data = await getDistrictSchoolsData(userId);
        console.log('SchoolTestAverages: Received data:', data);
        setSchoolsData(data);
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
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (schoolsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Test Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No schools found in your district (User ID: {userId})
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Check console for debugging information
          </p>
        </CardContent>
      </Card>
    );
  }

  const districtAverage = schoolsData.length > 0
    ? schoolsData.reduce((sum, school) => sum + school.avg_certification_score, 0) / schoolsData.length
    : 0;

  const totalStudentsTested = schoolsData.reduce((sum, school) => sum + school.total_students, 0);
  const totalStudentsInDistrict = totalStudentsTested; // This is the same for now

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          School Test Averages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* District Summary */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h3 className="font-medium">District Average: {districtAverage.toFixed(0)}%</h3>
            <p className="text-sm text-muted-foreground">
              {totalStudentsTested} of {totalStudentsInDistrict} students tested • {
                totalStudentsInDistrict > 0 ? Math.round((totalStudentsTested / totalStudentsInDistrict) * 100) : 0
              }% tested
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <Badge variant="outline">{schoolsData.length} Schools</Badge>
          </div>
        </div>

        {/* Individual School Results */}
        <div className="space-y-2">
          {schoolsData
            .sort((a, b) => b.avg_certification_score - a.avg_certification_score)
            .map((school) => (
            <div key={school.school.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">{school.school.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {school.total_students} students • {school.total_classes} classes
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{school.avg_certification_score.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  {school.total_students > 0 ? "100% tested" : "No tests"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolTestAverages;