/**
 * Proficiency level mapping between ACTFL and CEFR scales
 * Used for adaptive AI behavior based on student level
 */

export const ACTFL_TO_CEFR: Record<string, string> = {
  'Novice Low': 'A1',
  'Novice Mid': 'A1',
  'Novice High': 'A1/A2',
  'Intermediate Low': 'A2',
  'Intermediate Mid': 'A2/B1',
  'Intermediate High': 'B1',
  'Advanced Low': 'B2',
  'Advanced Mid': 'B2/C1',
  'Advanced High': 'C1',
  'Superior': 'C2',
  'Distinguished': 'C2+'
};

export const CEFR_TO_ACTFL: Record<string, string> = {
  'A1': 'Novice Mid',
  'A2': 'Intermediate Low',
  'B1': 'Intermediate High',
  'B2': 'Advanced Low',
  'C1': 'Advanced High',
  'C2': 'Superior'
};

/**
 * AI behavior configuration based on proficiency level
 * Controls how much native language support the AI provides
 */
export interface LevelBehavior {
  responseComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  sentenceLength: 'short' | 'medium' | 'long' | 'varied';
  nativeLanguageRatio: number; // 0.0 to 1.0 - how much native language to use
  vocabularyLevel: string;
  grammarFocus: string[];
  explanationStyle: 'native_heavy' | 'mixed' | 'target_heavy' | 'target_only';
}

export const LEVEL_AI_BEHAVIOR: Record<string, LevelBehavior> = {
  'A1': {
    responseComplexity: 'simple',
    sentenceLength: 'short',
    nativeLanguageRatio: 0.6,  // 60% native language support
    vocabularyLevel: 'basic_500',
    grammarFocus: ['present_simple', 'basic_questions', 'common_nouns'],
    explanationStyle: 'native_heavy'
  },
  'A2': {
    responseComplexity: 'simple',
    sentenceLength: 'short',
    nativeLanguageRatio: 0.45,  // 45% native language support
    vocabularyLevel: 'elementary_1000',
    grammarFocus: ['present_continuous', 'past_simple', 'basic_prepositions'],
    explanationStyle: 'native_heavy'
  },
  'B1': {
    responseComplexity: 'moderate',
    sentenceLength: 'medium',
    nativeLanguageRatio: 0.25,  // 25% native language support
    vocabularyLevel: 'intermediate_2000',
    grammarFocus: ['past_tenses', 'conditionals_type1', 'modal_verbs'],
    explanationStyle: 'mixed'
  },
  'B2': {
    responseComplexity: 'complex',
    sentenceLength: 'medium',
    nativeLanguageRatio: 0.12,  // 12% native language support
    vocabularyLevel: 'upper_intermediate_4000',
    grammarFocus: ['conditionals_type2_3', 'passive_voice', 'reported_speech'],
    explanationStyle: 'target_heavy'
  },
  'C1': {
    responseComplexity: 'advanced',
    sentenceLength: 'long',
    nativeLanguageRatio: 0.05,  // 5% native language support
    vocabularyLevel: 'advanced_6000',
    grammarFocus: ['complex_structures', 'nuanced_expressions', 'formal_registers'],
    explanationStyle: 'target_only'
  },
  'C2': {
    responseComplexity: 'advanced',
    sentenceLength: 'varied',
    nativeLanguageRatio: 0.02,  // 2% - almost never
    vocabularyLevel: 'native_like',
    grammarFocus: ['stylistic_choices', 'idiomatic_expressions', 'register_switching'],
    explanationStyle: 'target_only'
  }
};

/**
 * Get the behavior configuration for a given CEFR level
 */
export const getLevelBehavior = (cefrLevel: string): LevelBehavior => {
  // Normalize level (handle variations like "A1/A2", "B1+", etc.)
  const normalizedLevel = cefrLevel.split('/')[0].replace('+', '').toUpperCase();
  return LEVEL_AI_BEHAVIOR[normalizedLevel] || LEVEL_AI_BEHAVIOR['B1'];
};

/**
 * Map conversation level setting to CEFR level
 */
export const conversationLevelToCEFR = (level: string): string => {
  const mapping: Record<string, string> = {
    'basic': 'A1',
    'intermediate': 'B1',
    'advanced': 'C1'
  };
  return mapping[level] || 'B1';
};

/**
 * Get native language usage recommendation as a percentage string
 */
export const getNativeLanguageGuidance = (cefrLevel: string): string => {
  const behavior = getLevelBehavior(cefrLevel);
  const percentage = Math.round(behavior.nativeLanguageRatio * 100);
  
  if (percentage >= 50) {
    return `Use ${behavior.explanationStyle === 'native_heavy' ? 'primarily' : 'frequently'} the student's native language (${percentage}%) for explanations and support.`;
  } else if (percentage >= 20) {
    return `Use a mix of target and native language. Native language for complex explanations only (${percentage}%).`;
  } else if (percentage >= 10) {
    return `Primarily use target language. Only use native language for critical clarifications (${percentage}%).`;
  } else {
    return `Use target language almost exclusively. Native language only if absolutely necessary (${percentage}%).`;
  }
};
