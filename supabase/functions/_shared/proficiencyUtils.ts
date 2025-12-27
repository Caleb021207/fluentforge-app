/**
 * Shared proficiency utilities for edge functions
 * Mirrors src/utils/proficiencyMapping.ts for backend use
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

export interface LevelBehavior {
  responseComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  sentenceLength: 'short' | 'medium' | 'long' | 'varied';
  nativeLanguageRatio: number;
  vocabularyLevel: string;
  grammarFocus: string[];
  explanationStyle: 'native_heavy' | 'mixed' | 'target_heavy' | 'target_only';
}

export const LEVEL_AI_BEHAVIOR: Record<string, LevelBehavior> = {
  'A1': {
    responseComplexity: 'simple',
    sentenceLength: 'short',
    nativeLanguageRatio: 0.6,
    vocabularyLevel: 'basic_500',
    grammarFocus: ['present_simple', 'basic_questions', 'common_nouns'],
    explanationStyle: 'native_heavy'
  },
  'A2': {
    responseComplexity: 'simple',
    sentenceLength: 'short',
    nativeLanguageRatio: 0.45,
    vocabularyLevel: 'elementary_1000',
    grammarFocus: ['present_continuous', 'past_simple', 'basic_prepositions'],
    explanationStyle: 'native_heavy'
  },
  'B1': {
    responseComplexity: 'moderate',
    sentenceLength: 'medium',
    nativeLanguageRatio: 0.25,
    vocabularyLevel: 'intermediate_2000',
    grammarFocus: ['past_tenses', 'conditionals_type1', 'modal_verbs'],
    explanationStyle: 'mixed'
  },
  'B2': {
    responseComplexity: 'complex',
    sentenceLength: 'medium',
    nativeLanguageRatio: 0.12,
    vocabularyLevel: 'upper_intermediate_4000',
    grammarFocus: ['conditionals_type2_3', 'passive_voice', 'reported_speech'],
    explanationStyle: 'target_heavy'
  },
  'C1': {
    responseComplexity: 'advanced',
    sentenceLength: 'long',
    nativeLanguageRatio: 0.05,
    vocabularyLevel: 'advanced_6000',
    grammarFocus: ['complex_structures', 'nuanced_expressions', 'formal_registers'],
    explanationStyle: 'target_only'
  },
  'C2': {
    responseComplexity: 'advanced',
    sentenceLength: 'varied',
    nativeLanguageRatio: 0.02,
    vocabularyLevel: 'native_like',
    grammarFocus: ['stylistic_choices', 'idiomatic_expressions', 'register_switching'],
    explanationStyle: 'target_only'
  }
};

/**
 * Get behavior configuration for a CEFR level
 */
export const getLevelBehavior = (cefrLevel: string): LevelBehavior => {
  const normalizedLevel = cefrLevel.split('/')[0].replace('+', '').toUpperCase();
  return LEVEL_AI_BEHAVIOR[normalizedLevel] || LEVEL_AI_BEHAVIOR['B1'];
};

/**
 * Convert conversation setting to CEFR level
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
 * Generate native language guidance for system prompts
 */
export const getNativeLanguageGuidance = (
  behavior: LevelBehavior, 
  userLanguage: string, 
  targetLanguage: string
): string => {
  const percentage = Math.round(behavior.nativeLanguageRatio * 100);
  
  if (behavior.explanationStyle === 'native_heavy') {
    return `LANGUAGE SUPPORT - HIGH NATIVE LANGUAGE MODE (${percentage}% ${userLanguage}):
- Use ${userLanguage} for ${percentage}% of your responses
- ALWAYS provide ${userLanguage} translations for new vocabulary
- Explain grammar concepts primarily in ${userLanguage}
- When the student seems confused, immediately switch to ${userLanguage}
- Use short, simple ${targetLanguage} phrases with immediate translations
- Focus on building confidence through understanding`;
  }
  
  if (behavior.explanationStyle === 'mixed') {
    return `LANGUAGE SUPPORT - BALANCED MODE (${percentage}% ${userLanguage}):
- Use ${targetLanguage} for most of your response (~${100 - percentage}%)
- Provide ${userLanguage} support for complex explanations
- Translate new or difficult vocabulary
- Mix languages naturally based on topic difficulty`;
  }
  
  if (behavior.explanationStyle === 'target_heavy') {
    return `LANGUAGE SUPPORT - IMMERSIVE MODE (${percentage}% ${userLanguage}):
- Use ${targetLanguage} for ${100 - percentage}% of your response
- Only use ${userLanguage} for critical clarifications
- Challenge the student to understand from context
- Provide translations only when explicitly requested or clearly needed`;
  }
  
  // target_only
  return `LANGUAGE SUPPORT - FULL IMMERSION (${percentage}% ${userLanguage}):
- Use ${targetLanguage} almost exclusively (${100 - percentage}%+)
- Only use ${userLanguage} if absolutely critical for safety or comprehension
- Treat the student as near-native level
- Use sophisticated vocabulary and complex structures`;
};

/**
 * Generate complexity guidance for system prompts
 */
export const getComplexityGuidance = (behavior: LevelBehavior): string => {
  const guidelines: string[] = [];
  
  // Sentence length guidance
  switch (behavior.sentenceLength) {
    case 'short':
      guidelines.push('Keep sentences SHORT (5-10 words maximum)');
      guidelines.push('Use simple sentence structures (Subject-Verb-Object)');
      break;
    case 'medium':
      guidelines.push('Use medium-length sentences (10-20 words)');
      guidelines.push('Include some compound sentences with connecting words');
      break;
    case 'long':
      guidelines.push('Use longer, more complex sentences');
      guidelines.push('Include subordinate clauses and varied structures');
      break;
    case 'varied':
      guidelines.push('Vary sentence length naturally as a native speaker would');
      guidelines.push('Use sophisticated sentence structures and literary devices');
      break;
  }
  
  // Vocabulary guidance
  switch (behavior.vocabularyLevel) {
    case 'basic_500':
      guidelines.push('ONLY use the 500 most common words');
      guidelines.push('Avoid idioms, slang, or specialized vocabulary');
      break;
    case 'elementary_1000':
      guidelines.push('Use vocabulary from the 1000 most common words');
      guidelines.push('Introduce simple idioms with explanations');
      break;
    case 'intermediate_2000':
      guidelines.push('Use vocabulary up to 2000 common words');
      guidelines.push('Include some idiomatic expressions');
      break;
    case 'upper_intermediate_4000':
      guidelines.push('Use broader vocabulary (4000+ words)');
      guidelines.push('Include idiomatic expressions and phrasal verbs');
      break;
    case 'advanced_6000':
      guidelines.push('Use advanced vocabulary freely');
      guidelines.push('Include nuanced expressions and formal/informal registers');
      break;
    case 'native_like':
      guidelines.push('Use vocabulary without restrictions');
      guidelines.push('Include regional expressions, slang, and cultural references');
      break;
  }
  
  // Grammar focus
  if (behavior.grammarFocus.length > 0) {
    guidelines.push(`Grammar focus: ${behavior.grammarFocus.join(', ')}`);
  }
  
  return guidelines.join('\n');
};
