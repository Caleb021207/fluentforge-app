import { useState } from "react";
import { InteractiveCard } from "@/components/ui/card";
import { Users, BarChart3, LayoutDashboard } from "lucide-react";
import { ExtendedUserProfile } from "@/types/school";
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
  const [classAverage, setClassAverage] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Single Entry Point - Teacher Dashboard */}
      <InteractiveCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            {t("teacherTools") || "Teacher Tools"}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/teacher/dashboard")}
              size="lg"
              className="flex-1 h-auto py-6"
            >
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                <span className="text-lg font-semibold">{t("teacherDashboard") || "Teacher Dashboard"}</span>
                <span className="text-sm opacity-80">
                  {t("manageClassesStudentsAssignments") || "Classes, Students, Analytics & Assignments"}
                </span>
              </div>
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
