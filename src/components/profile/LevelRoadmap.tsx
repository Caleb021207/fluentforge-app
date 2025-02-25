
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp } from "lucide-react";
import { getLevelDescription } from "@/components/certifications/utils/scoreUtils";

interface LevelRoadmapProps {
  currentLevel: string;
  targetLevel: string;
  targetDate: string;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LevelRoadmap = ({ currentLevel, targetLevel, targetDate }: LevelRoadmapProps) => {
  const calculateProgressToNextLevel = () => {
    const currentLevelIndex = CEFR_LEVELS.indexOf(currentLevel);
    const targetLevelIndex = CEFR_LEVELS.indexOf(targetLevel);
    
    if (currentLevelIndex === -1 || targetLevelIndex === -1) return 0;
    if (currentLevelIndex >= targetLevelIndex) return 100;
    
    const totalLevels = targetLevelIndex - currentLevelIndex;
    return Math.round((1 / totalLevels) * 100);
  };

  const getRemainingTime = () => {
    if (!targetDate) return "No target date set";
    
    const target = new Date(targetDate);
    const now = new Date();
    const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Target date has passed";
    if (days === 0) return "Today is the target date";
    return `${days} days remaining`;
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          CEFR Level Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentLevel || 'Not assessed'}</span>
              <span>{targetLevel}</span>
            </div>
            <Progress value={calculateProgressToNextLevel()} />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium">Progress to Goal</span>
              <span className="text-sm text-gray-600">{calculateProgressToNextLevel()}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{getRemainingTime()}</span>
          </div>

          <div className="grid gap-4 mt-4">
            {CEFR_LEVELS.map((level, index) => {
              const currentLevelIndex = CEFR_LEVELS.indexOf(currentLevel);
              const targetLevelIndex = CEFR_LEVELS.indexOf(targetLevel);
              const isCompleted = currentLevelIndex >= index;
              const isCurrent = currentLevelIndex === index;
              const isTarget = targetLevelIndex === index;

              return (
                <div
                  key={level}
                  className={`p-3 rounded-lg border ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-200'
                      : isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isTarget
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{level}</span>
                    <span className="text-sm">
                      {isCurrent && '(Current)'}
                      {isTarget && '(Target)'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getLevelDescription(level)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelRoadmap;
