
import { Lesson } from "../data/lessonData";

export const getLevelColor = (level: string) => {
  switch (level) {
    case "beginner":
      return "text-green-600";
    case "intermediate":
      return "text-blue-600";
    case "advanced":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};

export const getCefrLevel = (level: string) => {
  switch (level) {
    case "beginner":
      return "A1-A2";
    case "intermediate":
      return "B1-B2";
    case "advanced":
      return "C1-C2";
    default:
      return "";
  }
};

export const calculateTotalXP = (lessonsArray: Lesson[] = []) => {
  return lessonsArray.reduce((acc, lesson) => acc + lesson.xpPoints, 0);
};

export const calculateEarnedXP = (lessonsArray: Lesson[] = []) => {
  return lessonsArray.reduce((acc, lesson) => 
    acc + ((lesson.progress || 0) / 100 * lesson.xpPoints), 0);
};

export const calculateTotalLessonsCount = (lessonsByLevel: Record<string, Lesson[]>) => {
  return Object.values(lessonsByLevel).reduce(
    (acc, levelLessons) => acc + (levelLessons?.length || 0), 0
  );
};

export const calculateCompletedLessonsCount = (lessonsByLevel: Record<string, Lesson[]>) => {
  return Object.values(lessonsByLevel).reduce(
    (acc, levelLessons) => acc + ((levelLessons || [])
      .filter(lesson => (lesson.progress || 0) === 100).length), 0
  );
};
