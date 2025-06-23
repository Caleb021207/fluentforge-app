
import { TranslationRecord } from "@/translations/types";
import { STANDARD_TRANSLATION_TEMPLATE } from "./standardTranslationTemplate";

// English fallbacks for critical UI elements
const ENGLISH_FALLBACKS: TranslationRecord = {
  home: "Home",
  practice: "Practice",
  textPractice: "Text Practice",
  unlimitedVoicePractice: "Unlimited Voice Practice",
  signIn: "Sign In",
  getStarted: "Get Started",
  send: "Send",
  loading: "Loading",
  error: "Error",
  startConversationIn: "Start conversation in {language}",
  practiceGuide: "{language} Practice Guide",
  practiceGuideDescription: "Here are some tips to get the most out of your {language} practice:",
  practiceGuideItem1: "Try to form complete sentences, even if they're simple.",
  practiceGuideItem2: "Don't worry about mistakes — they're part of learning!",
  practiceGuideItem3: "Ask for explanations if there's something you don't understand.",
  practiceGuideItem4: "Use words you've learned recently.",
  practiceDisclaimer: "Our AI will adapt to your skill level and gradually help you improve.",
  practiceTip1: "Try to form complete sentences, even if they're simple.",
  practiceTip2: "Don't worry about mistakes — they're part of learning!",
  practiceTip3: "Ask for explanations if there's something you don't understand.",
  practiceTip4: "Use words you've learned recently.",
  practiceTip5: "Our AI will adapt to your skill level and gradually help you improve."
};

// Create enhanced translations with fallbacks
export function createEnhancedTranslations(translations: TranslationRecord): TranslationRecord {
  const enhanced = { ...translations };
  
  // Add fallbacks for missing keys
  Object.keys(STANDARD_TRANSLATION_TEMPLATE).forEach(key => {
    if (!enhanced[key] || enhanced[key].trim() === '') {
      // Use English fallback if available
      if (ENGLISH_FALLBACKS[key]) {
        enhanced[key] = ENGLISH_FALLBACKS[key];
      } else {
        // Generate a reasonable fallback
        enhanced[key] = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      }
    }
  });
  
  return enhanced;
}

// Validate and clean translation values
export function cleanTranslationValue(value: string, key: string, language: string): string {
  if (!value || value.trim() === '') {
    return ENGLISH_FALLBACKS[key] || key;
  }
  
  // Remove any HTML tags that might have been accidentally included
  const cleaned = value.replace(/<[^>]*>/g, '').trim();
  
  // Ensure the value isn't just whitespace or placeholder text
  if (cleaned === '' || cleaned === 'TODO' || cleaned === 'TRANSLATE') {
    return ENGLISH_FALLBACKS[key] || key;
  }
  
  return cleaned;
}

// Apply fallback system to a language's translations
export function applyFallbackSystem(translations: TranslationRecord, language: string): TranslationRecord {
  const enhanced = createEnhancedTranslations(translations);
  
  // Clean and validate each translation value
  Object.keys(enhanced).forEach(key => {
    enhanced[key] = cleanTranslationValue(enhanced[key], key, language);
  });
  
  return enhanced;
}
