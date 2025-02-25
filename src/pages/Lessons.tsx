
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/lessons/LevelSelector";
import LessonsList from "@/components/lessons/LessonsList";
import LessonView from "@/components/lessons/LessonView";
import { useUserProgress } from "@/components/lessons/hooks/useUserProgress";
import { LevelName, Lesson, LessonStats } from "@/components/lessons/types";
import lessonsByLevel from "@/components/lessons/data/lessonData";
import { 
  calculateTotalXP, 
  calculateEarnedXP,
  calculateTotalLessonsCount,
  calculateCompletedLessonsCount
} from "@/components/lessons/utils/lessonUtils";

const Lessons = () => {
  const [searchParams] = useSearchParams();
  const level = (searchParams.get("level") || "beginner") as LevelName;
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  
  const { lessons, isLoading } = useUserProgress(level);
  
  const totalXP = calculateTotalXP(lessons);
  const earnedXP = calculateEarnedXP(lessons);
  const totalLessonsCount = calculateTotalLessonsCount(lessonsByLevel);
  const completedLessonsCount = calculateCompletedLessonsCount(lessonsByLevel);

  const stats: LessonStats = {
    totalLessons: totalLessonsCount,
    completedLessons: completedLessonsCount,
    totalXP: totalXP,
    earnedXP: earnedXP,
    currentStreak: 5,
    nextLevel: "B1",
    nextMilestone: 1000,
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
    // When lesson is completed, update the UI and potentially store progress
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
        <h1 className="text-2xl font-bold mb-1">Spanish Lessons <span className="text-green-600 font-normal">(A1-A2)</span></h1>
        
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
