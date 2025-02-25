
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ChallengeList from "./ChallengeList";
import { LucideIcon } from "lucide-react";

interface LessonCardProps {
  lesson: {
    id: number;
    title: string;
    description: string;
    duration: string;
    icon: JSX.Element;
    vocabulary: string[];
    xpPoints: number;
    difficulty: "Easy" | "Medium" | "Hard";
    progress?: number;
    cefrLevel: string;
    challenges: {
      type: string;
      description: string;
      xpReward: number;
      timeLimit?: number;
      unlocked: boolean;
    }[];
    requiresVoice?: boolean;
  };
  onStart: (lessonId: number) => void;
}

const LessonCard = ({ lesson, onStart }: LessonCardProps) => {
  const getDifficultyColor = (difficulty: "Easy" | "Medium" | "Hard") => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "Hard":
        return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${
          lesson.requiresVoice 
            ? "bg-purple-100" 
            : "bg-lingua-primary/10"
        }`}>
          {lesson.icon}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">{lesson.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {lesson.requiresVoice && (
                  <div className="flex items-center text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    <span className="h-4 w-4 mr-1">🎤</span>
                    Voice Required
                  </div>
                )}
                <span className={`px-2 py-1 rounded text-sm ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty}
                </span>
                <span className="text-sm text-gray-500">{lesson.duration}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">{lesson.description}</p>
          
          <div className="border-t border-gray-100 pt-4 mt-4">
            <ChallengeList challenges={lesson.challenges} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-1 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-500">{lesson.progress || 0}%</span>
              </div>
              <Progress value={lesson.progress || 0} className="h-2" />
            </div>
            <Button 
              size="sm" 
              className="ml-4"
              onClick={() => onStart(lesson.id)}
            >
              {lesson.progress ? "Continue" : "Start"} ({lesson.xpPoints} XP)
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LessonCard;
