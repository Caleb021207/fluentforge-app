
import { Progress } from "@/components/ui/progress";

interface LessonStatsProps {
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  earnedXP: number;
  currentStreak: number;
  nextLevel: string;
  nextMilestone: number;
}

const LessonStats = ({
  totalLessons,
  completedLessons,
  totalXP,
  earnedXP,
  currentStreak,
  nextLevel,
  nextMilestone,
}: LessonStatsProps) => {
  const progressPercentage = totalXP > 0 ? Math.round((earnedXP / totalXP) * 100) : 0;
  const lessonsCompletedPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 grid gap-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">XP Progress</span>
          <span className="text-sm font-medium">{earnedXP}/{totalXP} XP</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Lessons Completed</span>
          <span className="text-sm font-medium">{completedLessons}/{totalLessons}</span>
        </div>
        <Progress value={lessonsCompletedPercentage} className="h-2" />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-2 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{currentStreak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg">
          <p className="text-xl font-bold text-purple-600">{nextLevel}</p>
          <p className="text-xs text-gray-500">Next Level</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded-lg">
          <p className="text-xl font-bold text-yellow-600">{nextMilestone}</p>
          <p className="text-xs text-gray-500">XP to Next</p>
        </div>
      </div>
    </div>
  );
};

export default LessonStats;
