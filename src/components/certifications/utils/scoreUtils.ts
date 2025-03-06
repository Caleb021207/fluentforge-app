
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
      return 'Mastery level: Reading - Can understand virtually any text, including abstract or complex documents. Writing - Can produce clear, flowing, complex texts in an appropriate style. Speaking - Can express themselves spontaneously and very fluently with precision in complex situations. Listening - Can understand any native speaker, even on abstract and complex topics.';
    case 'C1':
      return 'Advanced level: Reading - Can understand long, complex texts and recognize implicit meaning. Writing - Can produce clear, well-structured texts on complex subjects. Speaking - Can express ideas fluently and spontaneously without obvious searching for expressions. Listening - Can understand extended speech even when not clearly structured.';
    case 'B2':
      return 'Upper Intermediate: Reading - Can understand complex texts and technical articles. Writing - Can write clear, detailed text on a wide range of subjects. Speaking - Can interact with fluency and spontaneity with native speakers. Listening - Can understand extended speech and lectures, following complex lines of argument.';
    case 'B1':
      return 'Intermediate: Reading - Can understand texts on familiar matters. Writing - Can write simple connected text on familiar topics. Speaking - Can deal with most situations likely to arise while traveling. Listening - Can understand the main points of clear standard speech on familiar matters.';
    case 'A2':
      return 'Elementary: Reading - Can understand short, simple texts. Writing - Can write short, simple notes and messages. Speaking - Can communicate in simple and routine tasks requiring direct exchange of information. Listening - Can recognize familiar words and basic phrases when people speak slowly.';
    case 'A1':
      return 'Beginner: Reading - Can understand familiar names, words, and simple sentences. Writing - Can write short, simple phrases and fill out forms. Speaking - Can interact in a simple way with basic phrases and expressions. Listening - Can recognize familiar words and basic phrases when people speak slowly.';
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

// NEW FUNCTIONS FOR IMPROVED SCORING

export const analyzeSpeakingComplexity = (messages: any[]): number => {
  if (!messages || messages.length === 0) return 0;
  
  // Extract text content from messages
  const messageTexts = messages.map(msg => msg.content || "");
  
  // Calculate average words per message (measure of response length)
  const wordCounts = messageTexts.map(text => text.split(/\s+/).filter(Boolean).length);
  const avgWordsPerMessage = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
  
  // Calculate vocabulary diversity (unique words / total words)
  const allWords = messageTexts.join(' ').toLowerCase().split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(allWords);
  const vocabularyDiversity = uniqueWords.size / Math.max(1, allWords.length);
  
  // Average sentence length (proxy for complexity)
  const sentences = messageTexts.join('. ').split(/[.!?]+/).filter(Boolean);
  const avgSentenceLength = allWords.length / Math.max(1, sentences.length);
  
  // Scale factors based on CEFR expectations
  // A1: 3-5 words per sentence, very limited vocabulary
  // A2: 5-7 words per sentence, basic vocabulary
  // B1: 7-10 words per sentence, intermediate vocabulary
  // B2: 10-15 words per sentence, advanced vocabulary
  // C1: 15-20 words per sentence, sophisticated vocabulary
  // C2: 20+ words per sentence, expert vocabulary with nuance
  
  let complexityScore = 0;
  
  // Message count factor (encourages dialogue)
  const messageCountFactor = Math.min(1, messages.length / 5) * 2; // Up to 2 points
  
  // Length factor
  let lengthFactor = 0;
  if (avgWordsPerMessage >= 25) lengthFactor = 3;
  else if (avgWordsPerMessage >= 15) lengthFactor = 2.5;
  else if (avgWordsPerMessage >= 10) lengthFactor = 2;
  else if (avgWordsPerMessage >= 5) lengthFactor = 1;
  else lengthFactor = 0.5;
  
  // Sentence complexity factor
  let sentenceComplexityFactor = 0;
  if (avgSentenceLength >= 15) sentenceComplexityFactor = 3;
  else if (avgSentenceLength >= 10) sentenceComplexityFactor = 2.5;
  else if (avgSentenceLength >= 7) sentenceComplexityFactor = 2;
  else if (avgSentenceLength >= 5) sentenceComplexityFactor = 1;
  else sentenceComplexityFactor = 0.5;
  
  // Vocabulary diversity factor
  let vocabDiversityFactor = vocabularyDiversity * 10; // Scale to 0-2 range
  
  // Combine all factors for total complexity score (0-10 scale)
  complexityScore = messageCountFactor + lengthFactor + sentenceComplexityFactor + vocabDiversityFactor;
  complexityScore = Math.min(10, complexityScore); // Cap at 10
  
  console.log("Speaking analysis:", {
    messages: messages.length,
    avgWordsPerMessage,
    vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
    avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
    scores: {
      messageCountFactor,
      lengthFactor,
      sentenceComplexityFactor,
      vocabDiversityFactor
    },
    complexityScore
  });
  
  return complexityScore;
};

export const calculateEnhancedScore = (speechComplexity: number, messageCount: number): number => {
  // Base score calculation
  let baseScore = 50; // Start at A2 level
  
  // Minimum requirements for higher levels
  if (messageCount < 3) {
    return Math.min(65, baseScore + (speechComplexity * 3)); // Cap at B1 for very short conversations
  }
  
  // Apply complexity score exponentially to better differentiate higher levels
  // This ensures that higher complexity has a more pronounced effect
  const complexityFactor = Math.pow(speechComplexity, 1.2) * 8;
  
  // Message count bonus (encourage more interaction)
  const messageCountBonus = Math.min(15, messageCount * 1.5);
  
  // Calculate final score
  let finalScore = baseScore + complexityFactor + messageCountBonus;
  
  // Ensure appropriate scaling
  if (speechComplexity >= 9) {
    finalScore = Math.max(finalScore, 90); // Ensure C1+ for very high complexity
  } else if (speechComplexity >= 7.5) {
    finalScore = Math.max(finalScore, 85); // Ensure C1 minimum for high complexity
  } else if (speechComplexity >= 6) {
    finalScore = Math.max(finalScore, 78); // Ensure B2 minimum for good complexity
  } else if (speechComplexity >= 4) {
    finalScore = Math.max(finalScore, 65); // Ensure B1 minimum for moderate complexity
  }
  
  // Cap at 98% to leave room for human review
  finalScore = Math.min(98, finalScore);
  
  console.log("Enhanced score calculation:", {
    baseScore,
    complexityFactor,
    messageCountBonus,
    finalScore
  });
  
  return Math.round(finalScore);
};

export const generateDetailedFeedback = (
  speechComplexity: number, 
  messageCount: number, 
  averageWordsPerMessage: number,
  level: string
): {
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
} => {
  // Dynamic feedback based on conversation characteristics
  let feedback = "";
  let strengths: string[] = [];
  let areasToImprove: string[] = [];
  
  // Calculate factors for feedback
  const hasGoodVocabulary = speechComplexity >= 5;
  const hasGoodFluency = messageCount >= 4;
  const hasGoodElaboration = averageWordsPerMessage >= 10;
  
  // Base assessment based on level
  switch(level) {
    case 'C2':
      feedback = "You demonstrated mastery-level Spanish with sophisticated vocabulary, nuanced expressions, and near-native fluency. Your responses show excellent command of complex grammatical structures and cultural awareness.";
      strengths.push("Near-native fluency and natural expression");
      strengths.push("Sophisticated vocabulary and idiomatic expressions");
      strengths.push("Excellent grasp of complex grammatical structures");
      areasToImprove.push("Continue refining cultural nuances and regional expressions");
      areasToImprove.push("Practice with academic and specialized vocabulary");
      break;
    
    case 'C1':
      feedback = "You demonstrated advanced Spanish skills with fluent expression and a broad vocabulary. Your responses show strong command of complex structures and good spontaneity in conversation.";
      strengths.push("Fluent expression with minimal hesitation");
      strengths.push("Strong command of complex grammatical structures");
      strengths.push("Ability to discuss abstract and complex topics");
      areasToImprove.push("Continue developing idiomatic expressions and nuance");
      areasToImprove.push("Refine precision in specialized vocabulary");
      areasToImprove.push("Work on even greater spontaneity in responses");
      break;
      
    case 'B2':
      feedback = "You demonstrated upper-intermediate Spanish with good fluency and clear expression. You can discuss various topics with reasonable precision and maintain a conversation effectively.";
      strengths.push("Clear expression of opinions and ideas");
      strengths.push("Good range of vocabulary on various topics");
      strengths.push("Effective use of connectors and discourse markers");
      areasToImprove.push("Work on more complex grammatical structures");
      areasToImprove.push("Develop greater spontaneity in conversation");
      areasToImprove.push("Build more specialized vocabulary");
      break;
      
    case 'B1':
      feedback = "You demonstrated intermediate Spanish skills and can handle everyday conversational topics. You express yourself with reasonable clarity though with some grammatical limitations.";
      strengths.push("Ability to handle everyday conversation topics");
      strengths.push("Good basic vocabulary for familiar subjects");
      if (hasGoodElaboration) strengths.push("Ability to provide some detail in responses");
      areasToImprove.push("Work on expanding vocabulary range");
      areasToImprove.push("Practice more complex sentence structures");
      areasToImprove.push("Develop greater conversational spontaneity");
      break;
      
    case 'A2':
      feedback = "You demonstrated elementary Spanish skills and can handle simple exchanges. You can communicate basic needs and information about familiar topics.";
      strengths.push("Ability to handle basic communication needs");
      strengths.push("Can express simple opinions and preferences");
      if (hasGoodVocabulary) strengths.push("Growing vocabulary for everyday topics");
      areasToImprove.push("Practice longer responses and elaboration");
      areasToImprove.push("Work on connecting ideas with simple conjunctions");
      areasToImprove.push("Build vocabulary beyond basic everyday terms");
      break;
      
    case 'A1':
      feedback = "You demonstrated beginner Spanish skills and can use basic phrases and expressions. You can introduce yourself and answer simple questions about personal details.";
      strengths.push("Understanding of basic Spanish greetings and phrases");
      if (messageCount > 2) strengths.push("Ability to participate in simple exchanges");
      if (hasGoodVocabulary) strengths.push("Building vocabulary for basic communication");
      areasToImprove.push("Practice forming complete sentences");
      areasToImprove.push("Build vocabulary for everyday topics");
      areasToImprove.push("Work on basic present tense verb conjugations");
      break;
      
    default:
      feedback = "You participated in the Spanish conversation test. With continued practice, your language skills will develop further.";
      if (hasGoodVocabulary) strengths.push("Some good vocabulary usage");
      if (hasGoodFluency) strengths.push("Active participation in the conversation");
      areasToImprove.push("Continue building vocabulary and grammar skills");
      areasToImprove.push("Practice conversation regularly for greater fluency");
  }
  
  // Add dynamic feedback elements
  if (messageCount < 3) {
    feedback += " For a more accurate assessment, try to engage in longer conversations with more exchanges.";
    areasToImprove.push("Participate in longer conversations with more exchanges");
  }
  
  if (averageWordsPerMessage < 5) {
    areasToImprove.push("Try to elaborate more in your responses");
  }
  
  return { feedback, strengths, areasToImprove };
};
