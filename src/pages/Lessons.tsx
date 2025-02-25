
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Data and utils
import { lessonsByLevel, Lesson } from "@/data/lessonData";
import { 
  calculateTotalXP, 
  calculateEarnedXP,
  calculateTotalLessonsCount,
  calculateCompletedLessonsCount
} from "@/utils/lessonUtils";

// Components
import LessonHeader from "@/components/lessons/LessonHeader";
import LessonGrid from "@/components/lessons/LessonGrid";
import LessonView from "@/components/lessons/LessonView";
import LessonStats from "@/components/lessons/LessonStats";

const Lessons = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level") || "beginner";
  const [lessons, setLessons] = useState<Lesson[]>(lessonsByLevel[level] || []);
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchUserProgress = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('level', level);
            
          if (error) throw error;
          
          const progressMap = {};
          if (data) {
            data.forEach(item => {
              progressMap[item.lesson_id] = item.progress;
            });
          }
          
          setUserProgress(progressMap);
          
          const updatedLessons = lessonsByLevel[level].map(lesson => ({
            ...lesson,
            progress: progressMap[lesson.id] || 0
          }));
          
          setLessons(updatedLessons);
        } else {
          setLessons(lessonsByLevel[level]);
        }
      } catch (error) {
        console.error("Error fetching lesson progress:", error);
        setLessons(lessonsByLevel[level]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [level]);

  const totalXP = calculateTotalXP(lessons);
  const earnedXP = calculateEarnedXP(lessons);
  const totalLessonsCount = calculateTotalLessonsCount(lessonsByLevel);
  const completedLessonsCount = calculateCompletedLessonsCount(lessonsByLevel);

  const stats = {
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
    toast({
      title: "Lesson Completed",
      description: "Congratulations! You've earned XP for completing this lesson.",
    });
    setActiveLessonId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <LessonHeader currentLevel={level} onLevelChange={handleLevelChange} />
        
        {!activeLessonId && !isLoading && (
          <LessonStats {...stats} />
        )}
        
        {isLoading ? (
          <div>Loading...</div>
        ) : activeLessonId ? (
          <LessonView
            lesson={lessons.find(l => l.id === activeLessonId)!}
            onClose={() => setActiveLessonId(null)}
            onComplete={handleCompleteLesson}
          />
        ) : (
          <LessonGrid 
            lessons={lessons} 
            onStartLesson={handleStartLesson} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default Lessons;
