
import { AVAILABLE_LANGUAGES } from "@/translations";

export type LanguageCode = keyof typeof AVAILABLE_LANGUAGES;

interface LanguageConfig {
  name: string;
  nativeName: string;
  speechRecognitionLocale: string;
  speechSynthesisLocale: string;
  targetLanguage: LanguageCode; // The language being learned
  elevenLabsVoiceId?: string; // For premium voice
}

const languageConfigs: Record<LanguageCode, LanguageConfig> = {
  english: {
    name: "English",
    nativeName: "English",
    speechRecognitionLocale: "en-US",
    speechSynthesisLocale: "es-ES", // Learning Spanish
    targetLanguage: "spanish"
  },
  spanish: {
    name: "Spanish",
    nativeName: "Español",
    speechRecognitionLocale: "es-ES",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  portuguese: {
    name: "Portuguese",
    nativeName: "Português",
    speechRecognitionLocale: "pt-BR",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  korean: {
    name: "Korean",
    nativeName: "한국어",
    speechRecognitionLocale: "ko-KR",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  arabic: {
    name: "Arabic",
    nativeName: "العربية",
    speechRecognitionLocale: "ar-SA",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  mandarin: {
    name: "Mandarin",
    nativeName: "中文",
    speechRecognitionLocale: "zh-CN",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  vietnamese: {
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    speechRecognitionLocale: "vi-VN",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  french: {
    name: "French",
    nativeName: "Français",
    speechRecognitionLocale: "fr-FR",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english"
  },
  japanese: {
    name: "Japanese",
    nativeName: "日本語",
    speechRecognitionLocale: "ja-JP",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english",
    elevenLabsVoiceId: "pViLJpVDvXIBEL7BXbam"
  },
  russian: {
    name: "Russian",
    nativeName: "Русский",
    speechRecognitionLocale: "ru-RU",
    speechSynthesisLocale: "en-US", // Learning English
    targetLanguage: "english",
    elevenLabsVoiceId: "rlHSjx9Y19IqjWTspVRq"
  }
};

// Helper functions
export const getLanguageConfig = (language: LanguageCode): LanguageConfig => {
  return languageConfigs[language];
};

export const getTargetLanguage = (nativeLanguage: LanguageCode): LanguageCode => {
  return languageConfigs[nativeLanguage].targetLanguage;
};

export const getSpeechRecognitionLocale = (language: LanguageCode): string => {
  return languageConfigs[language].speechRecognitionLocale;
};

export const getSpeechSynthesisLocale = (language: LanguageCode): string => {
  return languageConfigs[language].speechSynthesisLocale;
};

export const getElevenLabsVoiceId = (language: LanguageCode): string | undefined => {
  return languageConfigs[language].elevenLabsVoiceId;
};

export const isAlwaysTranslatedLanguage = (language: LanguageCode): boolean => {
  return ["japanese", "russian", "french"].includes(language);
};

export default languageConfigs;
