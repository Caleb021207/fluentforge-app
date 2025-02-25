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
    <Card className="p-3 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-2">
        <div className={`p-1.5 rounded-lg w-fit ${
          lesson.requiresVoice 
            ? "bg-purple-100" 
            : "bg-lingua-primary/10"
        }`}>
          {lesson.icon}
        </div>
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-semibold truncate">{lesson.title}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {lesson.requiresVoice && (
                <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  <span className="h-3 w-3 mr-0.5">🎤</span>
                  Voice
                </div>
              )}
              <span className={`px-1.5 py-0.5 rounded text-xs ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <span className="text-xs text-gray-500">{lesson.duration}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{lesson.description}</p>
          
          <div className="border-t border-gray-100 pt-2">
            <ChallengeList challenges={lesson.challenges} />
          </div>

          <div className="flex flex-col pt-2 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-500">{lesson.progress || 0}%</span>
              </div>
              <Progress value={lesson.progress || 0} className="h-1.5" />
            </div>
            <Button 
              size="sm" 
              className="w-full text-xs py-1"
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
