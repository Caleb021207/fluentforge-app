
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lesson, UserProgress, LevelName } from "../types";
import lessonsByLevel from "../data/lessonData";

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

  return { lessons, isLoading, userProgress };
};
