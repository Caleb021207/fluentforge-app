
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lesson, UserProgress, LevelName, Unit } from "../types";
import unitsByLevel from "../data/lessonData";

// Helper function to flatten lessons from units
const getLessonsFromUnits = (units: Unit[]): Lesson[] => {
  return units.flatMap(unit => unit.lessons);
};

export const useUserProgress = (level: LevelName) => {
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          
          const progressMap: UserProgress = {};
          if (data) {
            data.forEach(item => {
              progressMap[item.lesson_id] = item.progress;
            });
          }
          
          setUserProgress(progressMap);
          
          // Get lessons from units and update their progress
          const allLessons = getLessonsFromUnits(unitsByLevel[level]);
          const updatedLessons = allLessons.map(lesson => ({
            ...lesson,
            progress: progressMap[lesson.id] || 0
          }));
          
          setLessons(updatedLessons);
        } else {
          // Get lessons from units if no user is logged in
          const allLessons = getLessonsFromUnits(unitsByLevel[level]);
          setLessons(allLessons);
        }
      } catch (error) {
        console.error("Error fetching lesson progress:", error);
        // Get lessons from units as fallback
        const allLessons = getLessonsFromUnits(unitsByLevel[level]);
        setLessons(allLessons);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [level]);

  return { lessons, isLoading, userProgress };
};
