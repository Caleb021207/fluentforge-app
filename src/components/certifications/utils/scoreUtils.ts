
export const calculateScore = (selectedAnswers: number[], questions: any[]) => {
  const correctAnswers = selectedAnswers.filter(
    (answer, index) => answer === questions[index].correctAnswer
  ).length;
  return Math.round((correctAnswers / questions.length) * 100);
};

export const determineLevel = (score: number) => {
  if (score >= 84) return 'C2';
  if (score >= 67) return 'C1';
  if (score >= 50) return 'B2';
  if (score >= 33) return 'B1';
  if (score >= 17) return 'A2';
  return 'A1';
};

export const getLevelDescription = (level: string) => {
  switch (level) {
    case 'C2':
      return 'Mastery - Can understand virtually everything heard or read. Can express themselves spontaneously, very fluently and precisely.';
    case 'C1':
      return 'Advanced - Can understand a wide range of demanding texts and recognize implicit meaning. Can use language flexibly and effectively.';
    case 'B2':
      return 'Upper Intermediate - Can understand the main ideas of complex texts. Can interact with a degree of fluency and spontaneity.';
    case 'B1':
      return 'Intermediate - Can understand the main points of clear standard input on familiar matters. Can deal with most situations likely to arise while traveling.';
    case 'A2':
      return 'Elementary - Can understand sentences and frequently used expressions. Can communicate in simple and routine tasks.';
    case 'A1':
      return 'Beginner - Can understand and use familiar everyday expressions and very basic phrases. Can introduce themselves and others.';
    default:
      return '';
  }
};

