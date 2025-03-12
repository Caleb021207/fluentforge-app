
export const calculateScore = (selectedAnswers: number[], questions: any[]) => {
  const correctAnswers = selectedAnswers.filter(
    (answer, index) => answer === questions[index].correctAnswer
  ).length;
  return Math.round((correctAnswers / questions.length) * 100);
};

export const determineLevel = (score: number) => {
  if (score >= 95) return 'C2';  // Mastery - nearly perfect performance
  if (score >= 88) return 'C1';  // Advanced - excellent performance
  if (score >= 78) return 'B2';  // Upper intermediate - good performance
  if (score >= 65) return 'B1';  // Intermediate - adequate performance
  if (score >= 50) return 'A2';  // Elementary - basic performance
  return 'A1';                  // Beginner - minimal performance
};

export const convertRawScoreToPercentage = (rawScore: number, maxScore: number = 5) => {
  const normalizedScore = Math.max(0, Math.min(rawScore, maxScore));
  return Math.round((normalizedScore / maxScore) * 100);
};

export const convertSkillScoreToPercentage = (score: number, maxScore: number = 10) => {
  const normalizedScore = Math.max(0, Math.min(score, maxScore));
  
  if (normalizedScore >= 9.5) {
    return 95 + (normalizedScore - 9.5) * 10; // 9.5=95% (C2), 10=100%
  } 
  else if (normalizedScore >= 8.8) {
    return 88 + (normalizedScore - 8.8) * 8.75; // 8.8=88% (C1), <9.5=<95%
  } 
  else if (normalizedScore >= 7.8) {
    return 78 + (normalizedScore - 7.8) * 10; // 7.8=78% (B2), <8.8=<88%
  } 
  else if (normalizedScore >= 6.5) {
    return 65 + (normalizedScore - 6.5) * 10; // 6.5=65% (B1), <7.8=<78%
  } 
  else if (normalizedScore >= 5.0) {
    return 50 + (normalizedScore - 5.0) * 10; // 5.0=50% (A2), <6.5=<65%
  } 
  else {
    return Math.round((normalizedScore / 5.0) * 50); // Scale from 0-50%
  }
};

export const getLevelDescription = (level: string) => {
  switch (level) {
    case 'C2':
      return 'Mastery level: Reading - Can understand virtually any English text, including abstract or complex documents. Writing - Can produce clear, flowing, complex texts in an appropriate style. Speaking - Can express themselves spontaneously and very fluently with precision in complex situations. Listening - Can understand any native English speaker, even on abstract and complex topics.';
    case 'C1':
      return 'Advanced level: Reading - Can understand long, complex English texts and recognize implicit meaning. Writing - Can produce clear, well-structured texts on complex subjects. Speaking - Can express ideas fluently and spontaneously without obvious searching for expressions. Listening - Can understand extended English speech even when not clearly structured.';
    case 'B2':
      return 'Upper Intermediate: Reading - Can understand complex English texts and technical articles. Writing - Can write clear, detailed text on a wide range of subjects. Speaking - Can interact with fluency and spontaneity with native English speakers. Listening - Can understand extended speech and lectures, following complex lines of argument.';
    case 'B1':
      return 'Intermediate: Reading - Can understand English texts on familiar matters. Writing - Can write simple connected text on familiar topics. Speaking - Can deal with most situations likely to arise while in an English-speaking environment. Listening - Can understand the main points of clear standard English on familiar matters.';
    case 'A2':
      return 'Elementary: Reading - Can understand short, simple English texts. Writing - Can write short, simple notes and messages. Speaking - Can communicate in simple and routine tasks requiring direct exchange of information. Listening - Can recognize familiar words and basic phrases when people speak slowly.';
    case 'A1':
      return 'Beginner: Reading - Can understand familiar names, words, and simple English sentences. Writing - Can write short, simple phrases and fill out forms. Speaking - Can interact in a simple way with basic phrases and expressions. Listening - Can recognize familiar words and basic phrases when people speak slowly.';
    default:
      return '';
  }
};

export const CEFR_TO_ACTFL = {
  'C2': 'Distinguished / Superior',
  'C1': 'Advanced High',
  'B2': 'Advanced Mid / Advanced Low',
  'B1': 'Intermediate High / Intermediate Mid',
  'A2': 'Intermediate Low / Novice High',
  'A1': 'Novice Mid / Novice Low'
};

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

export const ensureValidScore = (score: number | null | undefined) => {
  if (score === null || score === undefined) {
    console.warn('Score was null or undefined, returning default 0');
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const analyzeSpeakingComplexity = (userMessages: any[]) => {
  // Analyze the complexity of the user's speaking based on message content
  // Default to intermediate level
  return 6.5;
};

export const calculateEnhancedScore = (complexity: number, messageCount: number) => {
  // Calculate a score based on complexity and engagement
  // Default to B1 level score
  return 65;
};

export const generateDetailedFeedback = (
  complexity: number,
  messageCount: number,
  avgWordsPerResponse?: number,
  level?: string
): {
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
} => {
  const defaultStrengths = [
    "Active participation in English conversation",
    "Willingness to communicate in English",
    "Engagement with the conversation topics"
  ];
  
  const defaultAreasToImprove = [
    "Continue practicing English regularly",
    "Expand vocabulary in different subject areas",
    "Practice longer conversations for improved fluency"
  ];
  
  const defaultFeedback = `You completed the English conversation test. Your responses show your current English communication skills. With consistent practice, you will continue to develop your language abilities.`;
  
  return {
    feedback: defaultFeedback,
    strengths: defaultStrengths,
    areasToImprove: defaultAreasToImprove
  };
};
