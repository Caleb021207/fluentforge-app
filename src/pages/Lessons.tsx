
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/lessons/LevelSelector";
import LessonsList from "@/components/lessons/LessonsList";
import LessonView from "@/components/lessons/LessonView";
import { useUserProgress } from "@/components/lessons/hooks/useUserProgress";
import { LevelName, Lesson, LessonStats } from "@/components/lessons/types";
import unitsByLevel from "@/components/lessons/data/lessonData";
import { 
  calculateTotalXP, 
  calculateEarnedXP,
  calculateTotalLessonsCount,
  calculateCompletedLessonsCount,
  calculateLessonStats
} from "@/components/lessons/utils/lessonUtils";

const Lessons = () => {
  const [searchParams] = useSearchParams();
  const level = (searchParams.get("level") || "beginner") as LevelName;
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  
  const { progress, isLoading } = useUserProgress();
  
  // Convert progress to lessons format for compatibility
  const lessons = unitsByLevel[level]?.flatMap(unit => unit.lessons) || [];
  
  // We can now either use the utility functions directly with the lessons array
  // or use the calculateLessonStats function for a complete stats object
  const stats: LessonStats = calculateLessonStats(unitsByLevel);

  const getLevelCEFR = (level: LevelName) => {
    switch (level) {
      case "beginner":
        return "(A1-A2)";
      case "intermediate":
        return "(B1-B2)";
      case "advanced":
        return "(C1-C2)";
      default:
        return "(A1-A2)";
    }
  };

  const handleLevelChange = (newLevel: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("level", newLevel);
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
    window.location.reload();
  };

  const handleStartLesson = (lessonId: number) => {
    setActiveLessonId(lessonId);
  };

  const handleCompleteLesson = () => {
    toast({
      title: "Lesson Completed",
      description: "Congratulations! You've earned XP for completing this lesson.",
    });
    setActiveLessonId(null);
  };

  const activeLesson = activeLessonId 
    ? lessons.find(l => l.id === activeLessonId) 
    : null;

  return (
    <div className="container mx-auto px-4 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          Spanish Lessons <span className="text-green-600 font-normal">{getLevelCEFR(level)}</span>
        </h1>
        
        <div className="mb-6">
          <LevelSelector currentLevel={level} onLevelChange={handleLevelChange} />
        </div>
        
        {activeLessonId && activeLesson ? (
          <LessonView
            lesson={activeLesson}
            onClose={() => setActiveLessonId(null)}
            onComplete={handleCompleteLesson}
          />
        ) : (
          <LessonsList 
            lessons={lessons} 
            onSelectLesson={handleStartLesson} 
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Lessons;
