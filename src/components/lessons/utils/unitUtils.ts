
import unitsByLevel from "../data/lessonData";

export const calculateTotalXP = (units: any[]) => {
  return units.reduce((total, unit) => {
    const unitXP = unit.lessons.reduce((lessonTotal: number, lesson: any) => {
      return lessonTotal + (lesson.xpPoints || 0