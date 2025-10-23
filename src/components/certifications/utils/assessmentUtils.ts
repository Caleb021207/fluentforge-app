
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
  actflLevel: string;
  strengths: string[];
  areasForImprovement: string[];
  feedbackSummary: string;
}

export const getACTFLColor = (level: string): string => {
  const normalizedLevel = level.trim();
  switch(normalizedLevel) {
    case 'Distinguished': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Superior': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Advanced High':
    case 'Advanced Mid':
    case 'Advanced Low': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Intermediate High':
    case 'Intermediate Mid':
    case 'Intermediate Low': return 'bg-green-100 text-green-800 border-green-300';
    case 'Novice High':
    case 'Novice Mid': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Novice Low': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getACTFLDescription = (level: string): string => {
  const normalizedLevel = level.trim();
  switch(normalizedLevel) {
    case 'Distinguished':
      return 'Distinguished - Can tailor language to a variety of audiences by adapting speech and register in ways that are culturally authentic. Can use language skillfully, with accuracy, efficiency, and effectiveness.';
    case 'Superior':
      return 'Superior - Can communicate with accuracy and fluency in order to participate fully and effectively in conversations on a variety of topics in formal and informal settings.';
    case 'Advanced High':
      return 'Advanced High - Can narrate and describe with great ease and in detail across major time frames. Can handle linguistically unfamiliar situations with confidence.';
    case 'Advanced Mid':
      return 'Advanced Mid - Can handle a variety of communicative tasks with ease, confidence, and competence. Can narrate and describe in major time frames with good control.';
    case 'Advanced Low':
      return 'Advanced Low - Can narrate and describe in major time frames with good control. Can handle a variety of communicative tasks, though there may be occasional difficulty.';
    case 'Intermediate High':
      return 'Intermediate High - Can handle a variety of communicative tasks, although there may be some hesitation and inaccuracy. Can narrate and describe with some detail across major time frames.';
    case 'Intermediate Mid':
      return 'Intermediate Mid - Can handle successfully a variety of uncomplicated communicative tasks in straightforward social situations.';
    case 'Intermediate Low':
      return 'Intermediate Low - Can handle a limited number of uncomplicated communicative tasks involving topics related to basic personal information and some activities, preferences, and immediate needs.';
    case 'Novice High':
      return 'Novice High - Can handle a variety of tasks pertaining to the Intermediate level, but cannot sustain performance at that level. Can manage simple, straightforward Intermediate-level tasks, but unable to sustain sentence-level discourse.';
    case 'Novice Mid':
      return 'Novice Mid - Can communicate minimally with learned material. Can produce lists and memorized phrases. Can ask a few simple questions.';
    case 'Novice Low':
      return 'Novice Low - Can communicate using isolated words and high-frequency phrases. Has limited ability to create with the language.';
    default:
      return 'Level description not available.';
  }
};
