
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, BarChart } from "lucide-react";
import { getLevelDescription, CEFR_TO_ACTFL } from "@/components/certifications/utils/scoreUtils";

interface LevelRoadmapProps {
  currentLevel: string;
  targetLevel: string;
  targetDate: string;
  testScores?: {
    reading?: number;
    writing?: number;
    speaking?: number;
    listening?: number;
  };
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LevelRoadmap = ({ currentLevel, targetLevel, targetDate, testScores }: LevelRoadmapProps) => {
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

          {testScores && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart className="h-4 w-4 text-lingua-primary" />
                <h3 className="font-medium">Your Test Scores</h3>
              </div>
              <div className="grid gap-2">
                {testScores.reading !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reading:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.reading} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.reading}%</span>
                    </div>
                  </div>
                )}
                {testScores.writing !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Writing:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.writing} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.writing}%</span>
                    </div>
                  </div>
                )}
                {testScores.speaking !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Speaking:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.speaking} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.speaking}%</span>
                    </div>
                  </div>
                )}
                {testScores.listening !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Listening:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.listening} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.listening}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{getRemainingTime()}</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-sm font-medium mb-2">CEFR to ACTFL Conversion</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {Object.entries(CEFR_TO_ACTFL).map(([cefr, actfl]) => (
                <div key={cefr} className="flex justify-between">
                  <span className="font-medium">{cefr}:</span>
                  <span>{actfl}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
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
