
import { Trophy, Star, BookOpen, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  earnedXP: number;
  currentStreak: number;
  nextLevel: string;
  nextMilestone: number;
}

interface ProgressDashboardProps {
  stats: ProgressStats;
}

const ProgressDashboard = ({ stats }: ProgressDashboardProps) => {
  const progressPercentage = (stats.completedLessons / stats.totalLessons) * 100;
  const xpProgressPercentage = (stats.earnedXP / stats.totalXP) * 100;
  const { t } = useLocalization();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t("yourProgress")}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span>{t("lessonsCompleted")}</span>
            </div>
            <span className="font-medium">{stats.completedLessons} / {stats.totalLessons}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {progressPercentage.toFixed(1)}% {t("throughCurriculum")}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">{t("experienceAchievements")}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>{t("xpPoints")}</span>
            </div>
            <span className="font-medium">{stats.earnedXP} / {stats.totalXP}</span>
          </div>
          <Progress value={xpProgressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>{t("dailyStreak")}</span>
            </div>
            <span className="font-medium">{stats.currentStreak} {t("days")} 🔥</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span>{t("nextLevel")}</span>
            </div>
            <span className="font-medium">{stats.nextLevel}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
