
export interface AssessmentCategory {
  score: number;
  comments: string;
}

export interface TranscriptAssessment {
  assessment: {
    readingListeningComprehension: AssessmentCategory;
    writtenProduction: AssessmentCategory;
    spokenConversationalFluency: AssessmentCategory;
  };
  overallScore: number;
  cefrLevel: string;
  strengths: string[];
  areasForImprovement: string[];
  feedbackSummary: string;
}

export const getCEFRColor = (level: string): string => {
  switch(level.toUpperCase()) {
    case 'C2': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'C1': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'B2': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'B1': return 'bg-green-100 text-green-800 border-green-300';
    case 'A2': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'A1': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getCEFRDescription = (level: string): string => {
  switch(level.toUpperCase()) {
    case 'C2':
      return 'Proficient User (Mastery) - Can understand with ease virtually everything heard or read. Can express themselves spontaneously, very fluently and precisely.';
    case 'C1':
      return 'Proficient User (Advanced) - Can understand a wide range of demanding texts and recognize implicit meaning. Can express themselves fluently and spontaneously.';
    case 'B2':
      return 'Independent User (Upper Intermediate) - Can understand the main ideas of complex text. Can interact with a degree of fluency and spontaneity with native speakers.';
    case 'B1':
      return 'Independent User (Intermediate) - Can understand the main points of clear standard input on familiar matters. Can deal with most situations while traveling.';
    case 'A2':
      return 'Basic User (Elementary) - Can understand sentences and frequently used expressions. Can communicate in simple and routine tasks.';
    case 'A1':
      return 'Basic User (Beginner) - Can understand and use familiar everyday expressions and very basic phrases. Can introduce themselves and answer basic personal questions.';
    default:
      return 'Level description not available.';
  }
};
