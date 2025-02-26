
import unitsByLevel from "../data/lessonData";
import { Lesson, Unit, LevelName } from "../types";

// Helper function to get all lessons from units
const getAllLessons = (units: Unit[]): Lesson[] => {
  return units.flatMap(unit => unit.lessons);
};

export const calculateTotalXP = (units: Unit[]) => {
  return units.reduce((total, unit) => {
    const unitXP = unit.lessons.reduce((lessonTotal, lesson) => {
      return lessonTotal + (lesson.xpPoints || 0);
    }, 0);
    return total + unitXP;
  }, 0);
};

export const calculateEarnedXP = (units: Unit[]) => {
  return units.reduce((total, unit) => {
    const unitEarnedXP = unit.lessons.reduce((lessonTotal, lesson) => {
      return lessonTotal + ((lesson.progress || 0) / 100 * (lesson.xpPoints || 0));
    }, 0);
    return total + unitEarnedXP;
  }, 0);
};

export const calculateTotalLessonsCount = (unitsByLevel: Record<LevelName, Unit[]>) => {
  return Object.values(unitsByLevel).reduce((total, units) => {
    const unitLessons = units.reduce((unitsTotal, unit) => {
      return unitsTotal + unit.lessons.length;
    }, 0);
    return total + unitLessons;
  }, 0);
};

export const calculateCompletedLessonsCount = (unitsByLevel: Record<LevelName, Unit[]>) => {
  return Object.values(unitsByLevel).reduce((total, units) => {
    const completedLessons = units.reduce((unitsTotal, unit) => {
      const unitCompletedLessons = unit.lessons.reduce((lessonsTotal, lesson) => {
        return lessonsTotal + ((lesson.progress || 0) >= 100 ? 1 : 0);
      }, 0);
      return unitsTotal + unitCompletedLessons;
    }, 0);
    return total + completedLessons;
  }, 0);
};
