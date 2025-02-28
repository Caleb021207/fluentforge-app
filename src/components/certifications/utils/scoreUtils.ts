
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

// For speaking/listening we sometimes need to convert a raw score from 1-5 scale to 0-100
export const convertRawScoreToPercentage = (rawScore: number, maxScore: number = 5) => {
  // Ensure the score is between 0 and maxScore
  const normalizedScore = Math.max(0, Math.min(rawScore, maxScore));
  // Convert to percentage (0-100)
  return Math.round((normalizedScore / maxScore) * 100);
};

export const getLevelDescription = (level: string) => {
  switch (level) {
    case 'C2':
      return 'Mastery level: Reading - Can understand virtually any text, including abstract or complex documents. Writing - Can produce clear, flowing, complex texts in an appropriate style. Speaking - Can express themselves spontaneously and very fluently with precision in complex situations. Listening - Can understand any native speaker, even on abstract and complex topics.';
    case 'C1':
      return 'Advanced level: Reading - Can understand long, complex texts and recognize implicit meaning. Writing - Can produce clear, well-structured texts on complex subjects. Speaking - Can express ideas fluently and spontaneously without obvious searching for expressions. Listening - Can understand extended speech even when not clearly structured.';
    case 'B2':
      return 'Upper Intermediate: Reading - Can understand complex texts and technical articles. Writing - Can write clear, detailed text on a wide range of subjects. Speaking - Can interact with fluency and spontaneity with native speakers. Listening - Can understand extended speech and lectures, following complex lines of argument.';
    case 'B1':
      return 'Intermediate: Reading - Can understand texts on familiar matters. Writing - Can write simple connected text on familiar topics. Speaking - Can deal with most situations likely to arise while traveling. Listening - Can understand the main points of clear standard speech on familiar matters.';
    case 'A2':
      return 'Elementary: Reading - Can understand short, simple texts. Writing - Can write short, simple notes and messages. Speaking - Can communicate in simple and routine tasks requiring direct exchange of information. Listening - Can understand phrases and common vocabulary on basic personal and family information.';
    case 'A1':
      return 'Beginner: Reading - Can understand familiar names, words, and simple sentences. Writing - Can write short, simple phrases and fill out forms. Speaking - Can interact in a simple way with basic phrases and expressions. Listening - Can recognize familiar words and basic phrases when people speak slowly.';
    default:
      return '';
  }
};

// Convert CEFR levels to ACTFL proficiency levels
export const CEFR_TO_ACTFL = {
  'C2': 'Distinguished / Superior',
  'C1': 'Advanced High',
  'B2': 'Advanced Mid / Advanced Low',
  'B1': 'Intermediate High / Intermediate Mid',
  'A2': 'Intermediate Low / Novice High',
  'A1': 'Novice Mid / Novice Low'
};

// Convert ACTFL levels to CEFR
export const ACTFL_TO_CEFR = {
  'Distinguished': 'C2',
  'Superior': 'C2',
  'Advanced High': 'C1',
  'Advanced Mid': 'B2',
  'Advanced Low': 'B2',
  'Intermediate High': 'B1',
  'Intermediate Mid': 'B1',
  'Intermediate Low': 'A2',
  'Novice High': 'A2',
  'Novice Mid': 'A1',
  'Novice Low': 'A1'
};

// Helper function to ensure valid score calculation even with partial data
export const ensureValidScore = (score: number | null | undefined) => {
  if (score === null || score === undefined) {
    console.warn('Score was null or undefined, returning default 0');
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
};
