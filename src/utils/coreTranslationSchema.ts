
import { TranslationRecord } from "@/translations/types";

// Core schema for essential UI elements only
export const CORE_TRANSLATION_SCHEMA = {
  // Navigation elements
  "home": "string",
  "practice": "string", 
  "textPractice": "string",
  "unlimitedVoicePractice": "string",
  "voiceChat": "string",
  "pronunciationPractice": "string",
  "logout": "string",
  "login": "string",
  "signIn": "string",
  "createAccount": "string",
  
  // Home page elements
  "welcomeToLanguageLearning": "string",
  "yourPersonalAICompanion": "string", 
  "swipeUpToGetStarted": "string",
  "getStarted": "string",
  "goToDashboard": "string",
  
  // Text practice page
  "practiceYourLanguage": "string",
  "chatWithAI": "string",
  "startConversationIn": "string",
  "practiceGuide": "string",
  "practiceGuideDescription": "string",
  "practiceGuideItem1": "string",
  "practiceGuideItem2": "string", 
  "practiceGuideItem3": "string",
  "practiceGuideItem4": "string",
  "practiceDisclaimer": "string",
  "startTextChatting": "string",
  "typeMessageToPractice": "string",
  "send": "string",
  "clearConversation": "string",
  "correctGrammar": "string",
  
  // Voice chat page
  "freePracticeWithVoice": "string",
  "startSpeaking": "string",
  "listeningNow": "string",
  "youSaid": "string",
  "aiResponse": "string",
  "conversationStarters": "string",
  "tryThesePhrases": "string",
  "practiceWithVoiceChat": "string",
  "useThisTool": "string",
  "askQuestionsAboutTopics": "string",
  "practiceEverydayPhrases": "string", 
  "describeWhatYouSee": "string",
  "practiceVocabularyForSpecific": "string",
  "responseSuggestions": "string",
  "clickPlayToHear": "string",
  "startConversationToSee": "string",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "string",
  "selectComplexityLevel": "string",
  "chooseDifficultyLevelBasedOn": "string", 
  "selectLevelToStart": "string",
  "pronunciationPracticeTips": "string",
  "listenCarefullyTip": "string",
  "payAttentionToStressTip": "string",
  "practiceDifficultSoundsTip": "string",
  "recordYourselfTip": "string",
  "bePatientTip": "string",
  "novice": "string",
  "intermediate": "string",
  "advanced": "string", 
  "superior": "string",
  "startExercise": "string",
  "speechRate": "string",
  
  // Common UI elements
  "loading": "string",
  "error": "string",
  "cancel": "string",
  "save": "string",
  "back": "string",
  "continue": "string",
  "processing": "string"
} as const;

export type CoreTranslationKey = keyof typeof CORE_TRANSLATION_SCHEMA;

// Function to validate if a language has all core translations
export function validateCoreTranslations(translations: TranslationRecord): {
  isComplete: boolean;
  missingKeys: string[];
  completionPercentage: number;
} {
  const requiredKeys = Object.keys(CORE_TRANSLATION_SCHEMA);
  const providedKeys = Object.keys(translations);
  const missingKeys = requiredKeys.filter(key => !providedKeys.includes(key));
  
  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    completionPercentage: Math.round(((requiredKeys.length - missingKeys.length) / requiredKeys.length) * 100)
  };
}
