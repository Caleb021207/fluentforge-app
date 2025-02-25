
import { Question } from "../types/reading";

export const calculateScore = (selectedAnswers: number[], questions: Question[]): number => {
  let correct = 0;
  selectedAnswers.forEach((answer, index) => {
    if (answer === questions[index].correctAnswer) {
      correct++;
    }
  });
  return Math.round((correct / questions.length) * 100);
};

export const determineLevel = (
  score: number,
  currentLevel: string,
  questions: Question[]
): string => {
  if (score >= 80) {
    return currentLevel === 'C2' ? 'C2' : 
           questions.find(q => q.level > currentLevel)?.level || currentLevel;
  } else if (score >= 60) {
    return currentLevel;
  } else {
    return questions.find(q => q.level < currentLevel)?.level || currentLevel;
  }
};
