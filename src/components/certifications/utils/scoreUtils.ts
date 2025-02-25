
export const calculateScore = (selectedAnswers: number[], questions: any[]) => {
  const correctAnswers = selectedAnswers.filter(
    (answer, index) => answer === questions[index].correctAnswer
  ).length;
  return Math.round((correctAnswers / questions.length) * 100);
};

export const determineLevel = (score: number) => {
  if (score >= 90) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 70) return 'B2';
  if (score >= 60) return 'B1';
  if (score >= 50) return 'A2';
  if (score >= 40) return 'A1';
  return 'A1'; // Default to A1 for scores below 40
};

