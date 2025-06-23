
import { TranslationRecord } from "@/translations/types";

// Master schema defining all required translation keys
export const TRANSLATION_SCHEMA = {
  // Core UI elements
  "welcome": "string",
  "home": "string",
  "practice": "string",
  "lessons": "string",
  "progress": "string",
  "certificates": "string",
  "voiceChat": "string",
  "settings": "string",
  "profile": "string",
  "login": "string",
  "signup": "string",
  "logout": "string",
  "loading": "string",
  "error": "string",
  "save": "string",
  "cancel": "string",
  "submit": "string",
  "delete": "string",
  "edit": "string",
  "continue": "string",
  "back": "string",
  
  // Landing and auth
  "welcomeToLanguageLearning": "string",
  "yourPersonalAICompanion": "string",
  "swipeUpToGetStarted": "string",
  "getStarted": "string",
  "signIn": "string",
  "createAccount": "string",
  "goToDashboard": "string",
  "practiceWithAI": "string",
  "processing": "string",
  "send": "string",
  "success": "string",
  
  // Language selection
  "iSpeak": "string",
  "iWantToLearn": "string",
  "selectYourNativeLanguage": "string",
  "selectLanguageToLearn": "string",
  "saveLanguagePreferences": "string",
  "languagePreferencesSaved": "string",
  "youreNowLearning": "string",
  "from": "string",
  "pleaseSelectBothLanguages": "string",
  "youNeedToSelectBoth": "string",
  
  // Practice
  "textPractice": "string",
  "startChatting": "string",
  "typeMessage": "string",
  "messageCouldNotBeSent": "string",
  "pleaseTypeMessage": "string",
  "correctGrammar": "string",
  "startTextChatting": "string",
  "responseSuggestions": "string",
  "clickPlayToHear": "string",
  "startConversationToSee": "string",
  
  // Voice chat
  "freePracticeWithVoice": "string",
  "unlimitedVoicePractice": "string",
  "startSpeaking": "string",
  "stopListening": "string",
  "listeningNow": "string",
  "youSaid": "string",
  "aiResponse": "string",
  "playAgain": "string",
  "speaking": "string",
  "practiceWithVoiceChat": "string",
  "conversationStarters": "string",
  "tryThesePhrases": "string",
  "speechRecognitionError": "string",
  "speechRecognitionNotSupported": "string",
  "microphoneAccessRequired": "string",
  "failedToGetResponse": "string",
  "failedToGenerateSpeech": "string",
  "voiceChatEnded": "string",
  "browserBasedTTS": "string",
  
  // Premium voice
  "premiumVoiceChat": "string",
  "premiumVoiceChatBenefits": "string",
  "practiceDescription": "string",
  "aiModelInfo": "string",
  "practiceLevel": "string",
  "cefrA1Description": "string",
  "cefrA2Description": "string",
  "cefrB1Description": "string",
  "cefrB2Description": "string",
  "beginner": "string",
  "elementary": "string",
  "intermediate": "string",
  "upperIntermediate": "string",
  "selectCEFRLevel": "string",
  "selectedLevel": "string",
  "cooldownPeriodActive": "string",
  "cooldownActive": "string",
  "waitBeforeNextSession": "string",
  "loginRequired": "string",
  "pleaseLoginToAccessPremiumFeature": "string",
  "startVoiceChat": "string",
  "stopVoiceChat": "string",
  
  // Languages
  "languages.english": "string",
  "languages.spanish": "string",
  "languages.portuguese": "string",
  "languages.french": "string",
  "languages.japanese": "string",
  "languages.korean": "string",
  "languages.mandarin": "string",
  "languages.russian": "string",
  "languages.arabic": "string",
  "languages.hindi": "string",
  "languages.vietnamese": "string",
  "languages.ukrainian": "string",
  "languages.indonesian": "string",
  "languages.farsi": "string",
  "languages.bengali": "string",
  "languages.tagalog": "string",
  "languages.pashto": "string",
  
  // Practice page
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
  
  // UI elements
  "signedInAs": "string",
  "lightMode": "string",
  "darkMode": "string",
  "myClasses": "string",
  "myClass": "string",
  "createNewClass": "string",
  "className": "string",
  "creating": "string",
  "createClass": "string",
  "joinClass": "string",
  "enterClassCode": "string",
  "joining": "string",
  "unauthorized": "string",
  "teacherAccessRequired": "string",
  "generateCode": "string",
  
  // Navigation
  "pronunciationPractice": "string",
  "vocabulary": "string",
  "help": "string",
  "about": "string",
  "contact": "string",
  "admin": "string",
  "returnToHome": "string",
  "backToMenu": "string",
  
  // Pronunciation specific keys
  "improvePronunciationSkillsWith": "string",
  "selectComplexityLevel": "string",
  "chooseDifficultyLevelBasedOn": "string",
  "speechRate": "string",
  "selectLevelToStart": "string",
  "pronunciationPracticeTips": "string",
  "listenCarefullyTip": "string",
  "payAttentionToStressTip": "string",
  "practiceDifficultSoundsTip": "string",
  "recordYourselfTip": "string",
  "bePatientTip": "string",
  "novice": "string",
  "noviceLevelShortDescription": "string",
  "intermediateLevelShortDescription": "string",
  "advancedLevelShortDescription": "string",
  "superiorLevelShortDescription": "string",
  "advanced": "string",
  "superior": "string",
  "startExercise": "string",
  "generatingExercise": "string",
  "practiceExercise": "string",
  "levelDescription": "string",
  "yourPronunciation": "string",
  "startRecording": "string",
  "stopRecording": "string",
  "listeningToYou": "string",
  "realTimeTranscription": "string",
  "yourTranscription": "string",
  "clickStartToRecord": "string",
  "pronunciationFeedback": "string",
  "accuracyScore": "string",
  "intonationScore": "string",
  "fluencyScore": "string",
  "complexityScore": "string",
  "wordAnalysis": "string",
  "phonemeAnalysis": "string",
  "overallFeedback": "string",
  "excellent": "string",
  "good": "string",
  "fair": "string",
  "needsImprovement": "string",
  "tryAgain": "string",
  "newPhrase": "string",
  "generatingNewPhrase": "string",
  "topic": "string",
  "listenToPhrase": "string",
  "playing": "string",
  "clickWordToHear": "string",
  
  // Status messages
  "pageNotFound": "string",
  "networkConnectionIssue": "string",
  "pleaseWait": "string",
  "sessionExpired": "string",
  "dailyLimitReached": "string",
  "failedToCreateSession": "string",
  "speechSynthesisNotSupported": "string"
} as const;

export type TranslationKey = keyof typeof TRANSLATION_SCHEMA;

export interface TranslationValidationResult {
  isComplete: boolean;
  missingKeys: string[];
  totalKeys: number;
  foundKeys: number;
  completionPercentage: number;
}

export function validateTranslations(translations: TranslationRecord): TranslationValidationResult {
  const requiredKeys = Object.keys(TRANSLATION_SCHEMA);
  const providedKeys = Object.keys(translations);
  const missingKeys = requiredKeys.filter(key => !providedKeys.includes(key));
  
  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    totalKeys: requiredKeys.length,
    foundKeys: providedKeys.length,
    completionPercentage: Math.round((providedKeys.length / requiredKeys.length) * 100)
  };
}

export function generateMissingTranslations(translations: TranslationRecord, fallbackTranslations: TranslationRecord): TranslationRecord {
  const requiredKeys = Object.keys(TRANSLATION_SCHEMA);
  const result = { ...translations };
  
  for (const key of requiredKeys) {
    if (!result[key] && fallbackTranslations[key]) {
      result[key] = fallbackTranslations[key];
    }
  }
  
  return result;
}
