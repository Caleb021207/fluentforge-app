
import { useState, useEffect } from "react";
import { InteractiveCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, BarChart3, GraduationCap, TrendingUp } from "lucide-react";
import { ExtendedUserProfile } from "@/types/school";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CodeManagement from "@/components/admin/CodeManagement";
import StudentTestScores from "./StudentTestScores";
import { useLocalization } from "@/context/LocalizationContext";
import { LeaderboardSection } from "./LeaderboardSection";
import { useNavigate } from "react-router-dom";

interface TeacherProfileProps {
  profile: ExtendedUserProfile;
}

const TeacherProfile = ({ profile }: TeacherProfileProps) => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [classAverage, setClassAverage] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* View Class Metrics Button */}
      <InteractiveCard>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("classAnalytics")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("viewDetailedClassMetrics")}
              </p>
            </div>
            <Button
              onClick={() => navigate("/class-metrics")}
              className="w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("viewClassMetrics")}
            </Button>
          </div>
        </div>
      </InteractiveCard>

      {/* Student Test Scores - Top Priority */}
      <StudentTestScores 
        teacherId={profile.id} 
        onDataUpdate={(average, count) => {
          setClassAverage(average);
          setStudentCount(count);
        }}
      />

      {/* Access Code Management */}
      <CodeManagement userRole="teacher" userSchool={profile.school?.name} />

      {/* Leaderboard Section */}
      <LeaderboardSection />

      {/* Teaching Overview */}
      <InteractiveCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("teachingOverview")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {studentCount}
              </div>
              <p className="text-sm text-muted-foreground">{t("totalStudents")}</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {classAverage !== null ? `${classAverage}%` : 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">{t("classAverageScore")}</p>
            </div>
          </div>
        </div>
      </InteractiveCard>
    </div>
  );
};

export default TeacherProfile;
