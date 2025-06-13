
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, BarChart3, GraduationCap } from "lucide-react";
import { ExtendedUserProfile } from "@/types/school";
import { Skeleton } from "@/components/ui/skeleton";
import CodeManagement from "@/components/admin/CodeManagement";
import StudentTestScores from "./StudentTestScores";

interface TeacherProfileProps {
  profile: ExtendedUserProfile;
}

const TeacherProfile = ({ profile }: TeacherProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Student Test Scores - Top Priority */}
      <StudentTestScores teacherId={profile.id} />

      {/* Access Code Management */}
      <CodeManagement userRole="teacher" userSchool={profile.school?.name} />

      {/* Teacher Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
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
              <p className="text-sm text-muted-foreground">District</p>
              <p className="font-medium">{profile.school?.district || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teaching Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Your teaching statistics and class information will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfile;
