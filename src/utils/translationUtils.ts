
import { CORE_TRANSLATION_SCHEMA } from "./coreTranslationSchema";

// List of hardcoded English strings that should be replaced with t() calls
export const HARDCODED_STRINGS_TO_REPLACE = [
  // Home page
  "Welcome to Language Learning",
  "Your Personal AI Companion", 
  "Swipe up to get started",
  "Get Started",
  
  // Practice page  
  "Try to form complete sentences, even if they're simple.",
  "Don't worry about mistakes — they're part of learning!",
  "Ask for explanations if there's something you don't understand.",
  "Use words you've learned recently.",
  "Our AI will adapt to your skill level and gradually help you improve.",
  
  // Voice chat
  "Ask questions about everyday topics",
  "Practice common phrases and expressions", 
  "Describe what you see around you",
  "Practice vocabulary for specific topics like travel or food",
  "Click play to hear pronunciation",
  "Start a conversation to see suggestions",
  
  // Pronunciation
  "Listen carefully to the audio before attempting to speak",
  "Pay attention to stress patterns and intonation",
  "Practice difficult sounds multiple times", 
  "Record yourself and compare with native speakers",
  "Be patient - pronunciation improvement takes time"
];

// Function to check if a component has hardcoded strings
export function detectHardcodedStrings(componentContent: string): string[] {
  const found: string[] = [];
  
  HARDCODED_STRINGS_TO_REPLACE.forEach(str => {
    if (componentContent.includes(`"${str}"`) || componentContent.includes(`'${str}'`)) {
      found.push(str);
    }
  });
  
  return found;
}

// Function to get the translation key for a hardcoded string
export function getTranslationKeyForString(hardcodedString: string): string | null {
  const keyMap: Record<string, string> = {
    "Welcome to Language Learning": "welcomeToLanguageLearning",
    "Your Personal AI Companion": "yourPersonalAICompanion",
    "Swipe up to get started": "swipeUpToGetStarted", 
    "Get Started": "getStarted",
    "Try to form complete sentences, even if they're simple.": "practiceGuideItem1",
    "Don't worry about mistakes — they're part of learning!": "practiceGuideItem2",
    "Ask for explanations if there's something you don't understand.": "practiceGuideItem3",
    "Use words you've learned recently.": "practiceGuideItem4",
    "Our AI will adapt to your skill level and gradually help you improve.": "practiceDisclaimer",
    "Ask questions about everyday topics": "askQuestionsAboutTopics",
    "Practice common phrases and expressions": "practiceEverydayPhrases",
    "Describe what you see around you": "describeWhatYouSee", 
    "Practice vocabulary for specific topics like travel or food": "practiceVocabularyForSpecific",
    "Click play to hear pronunciation": "clickPlayToHear",
    "Start a conversation to see suggestions": "startConversationToSee",
    "Listen carefully to the audio before attempting to speak": "listenCarefullyTip",
    "Pay attention to stress patterns and intonation": "payAttentionToStressTip",
    "Practice difficult sounds multiple times": "practiceDifficultSoundsTip",
    "Record yourself and compare with native speakers": "recordYourselfTip",
    "Be patient - pronunciation improvement takes time": "bePatientTip"
  };
  
  return keyMap[hardcodedString] || null;
}
