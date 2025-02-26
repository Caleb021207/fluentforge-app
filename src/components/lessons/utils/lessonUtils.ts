
import { Lesson, LessonStats, LevelName, Unit } from "../types";
import unitsByLevel from "../data/lessonData";

// Helper function to get all lessons from units
const getAllLessons = (units: Unit[]): Lesson[] => {
  return units.flatMap(unit => unit.lessons);
};

export const calculateTotalXP = (lessons: Lesson[]): number => {
  return lessons.reduce((total, lesson) => total + (lesson.xpPoints || 0), 0);
};

export const calculateEarnedXP = (lessons: Lesson[]): number => {
  return lessons.reduce((total, lesson) => {
    const progress = lesson.progress || 0;
    const xpPoints = lesson.xpPoints || 0;
    return total + (progress / 100) * xpPoints;
  }, 0);
};

export const calculateTotalLessonsCount = (unitsByLevel: Record<LevelName, Unit[]>): number => {
  let total = 0;
  
  Object.values(unitsByLevel).forEach(units => {
    units.forEach(unit => {
      total += unit.lessons.length;
    });
  });
  
  return total;
};

export const calculateCompletedLessonsCount = (unitsByLevel: Record<LevelName, Unit[]>): number => {
  let completed = 0;
  
  Object.values(unitsByLevel).forEach(units => {
    units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        if ((lesson.progress || 0) >= 100) {
          completed++;
        }
      });
    });
  });
  
  return completed;
};

export const calculateLessonStats = (unitsByLevel: Record<LevelName, Unit[]>): LessonStats => {
  const totalLessons = calculateTotalLessonsCount(unitsByLevel);
  const completedLessons = calculateCompletedLessonsCount(unitsByLevel);
  
  // Calculate total XP across all levels
  let totalXP = 0;
  let earnedXP = 0;
  
  Object.values(unitsByLevel).forEach(units => {
    const allLessons = getAllLessons(units);
    totalXP += calculateTotalXP(allLessons);
    earnedXP += calculateEarnedXP(allLessons);
  });
  
  return {
    totalLessons,
    completedLessons,
    totalXP,
    earnedXP,
    currentStreak: 0, // This would need to be calculated from user data
    nextLevel: "B1", // This would need to be determined based on user progress
    nextMilestone: 1000, // This would be a target XP value for the next level
  };
};
