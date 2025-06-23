
import { TranslationRecord } from "@/translations/types";

// Standardized translation template with all required keys for consistent UI
export const STANDARD_TRANSLATION_TEMPLATE: TranslationRecord = {
  // Core navigation
  home: "",
  practice: "",
  textPractice: "",
  unlimitedVoicePractice: "",
  pronunciationPractice: "",
  voiceChat: "",
  settings: "",
  profile: "",
  login: "",
  logout: "",
  signIn: "",
  createAccount: "",
  
  // Landing page
  welcomeToLanguageLearning: "",
  yourPersonalAICompanion: "",
  swipeUpToGetStarted: "",
  getStarted: "",
  goToDashboard: "",
  
  // Language selection
  iSpeak: "",
  iWantToLearn: "",
  selectYourNativeLanguage: "",
  selectLanguageToLearn: "",
  saveLanguagePreferences: "",
  
  // Practice guide (standardized keys)
  practiceYourLanguage: "",
  chatWithAI: "",
  startConversationIn: "",
  practiceGuide: "",
  practiceGuideDescription: "",
  practiceGuideItem1: "",
  practiceGuideItem2: "",
  practiceGuideItem3: "",
  practiceGuideItem4: "",
  practiceDisclaimer: "",
  
  // Practice guide tips (standardized)
  practiceTip1: "",
  practiceTip2: "",
  practiceTip3: "",
  practiceTip4: "",
  practiceTip5: "",
  
  // Fallback keys for English practice guide items
  "Try to form complete sentences, even if they're simple.": "",
  "Don't worry about mistakes — they're part of learning!": "",
  "Ask for explanations if there's something you don't understand.": "",
  "Use words you've learned recently.": "",
  "Our AI will adapt to your skill level and gradually help you improve.": "",
  
  // Chat interface
  startTextChatting: "",
  typeMessageToPractice: "",
  chatPlaceholder: "",
  send: "",
  clearConversation: "",
  correctGrammar: "",
  
  // Response suggestions and hints
  responseSuggestions: "",
  clickPlayToHear: "",
  startConversationToSee: "",
  getResponseSuggestions: "",
  greetings: "",
  questions: "",
  startConversationForSuggestions: "",
  
  // Voice chat
  freePracticeWithVoice: "",
  startSpeaking: "",
  stopListening: "",
  listeningNow: "",
  youSaid: "",
  aiResponse: "",
  conversationStarters: "",
  tryThesePhrases: "",
  practiceWithVoiceChat: "",
  useThisTool: "",
  
  // Conversation phrases
  phrase1: "",
  phrase2: "",
  phrase3: "",
  phrase4: "",
  phrase5: "",
  phrase6: "",
  phrase7: "",
  phrase8: "",
  
  // Error handling
  error: "",
  couldNotGenerateHints: "",
  failedToPlayAudio: "",
  speechRecognitionError: "",
  microphoneAccessRequired: "",
  
  // Common UI
  loading: "",
  success: "",
  cancel: "",
  save: "",
  play: "",
  processing: ""
};

// Get all required translation keys
export const REQUIRED_TRANSLATION_KEYS = Object.keys(STANDARD_TRANSLATION_TEMPLATE);

// Validate if a language has all required keys
export function validateLanguageCompleteness(translations: TranslationRecord): {
  isComplete: boolean;
  missingKeys: string[];
  completionPercentage: number;
} {
  const missingKeys = REQUIRED_TRANSLATION_KEYS.filter(key => !translations[key] || translations[key].trim() === "");
  const completionPercentage = Math.round(((REQUIRED_TRANSLATION_KEYS.length - missingKeys.length) / REQUIRED_TRANSLATION_KEYS.length) * 100);
  
  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    completionPercentage
  };
}
