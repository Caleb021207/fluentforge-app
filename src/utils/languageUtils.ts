
/**
 * Returns information about language pairs based on user's interface language
 * For language learning, we need to know which language the user is practicing
 * and which language they are learning
 */
export const getLanguagePair = (currentLanguage: string) => {
  // Default language pairs with English translations
  // When a user selects a native language, we determine which language
  // they are learning (practicing) based on this configuration
  
  const normalizedLanguage = currentLanguage.toLowerCase();
  
  switch (normalizedLanguage) {
    case "english":
      return {
        practice: "Spanish", // English speakers learn Spanish
        native: "English"
      };
    case "spanish":
      return {
        practice: "English", // Spanish speakers learn English
        native: "Spanish"
      };
    case "portuguese":
      return {
        practice: "English",
        native: "Portuguese"
      };
    case "korean":
      return {
        practice: "English",
        native: "Korean"
      };
    case "arabic":
      return {
        practice: "English",
        native: "Arabic"
      };
    case "mandarin":
      return {
        practice: "English",
        native: "Mandarin"
      };
    case "vietnamese":
      return {
        practice: "English",
        native: "Vietnamese"
      };
    case "hindi":
      return {
        practice: "English",
        native: "Hindi"
      };
    case "japanese":
      return {
        practice: "English",
        native: "Japanese"
      };
    case "russian":
      return {
        practice: "English",
        native: "Russian"
      };
    case "ukrainian":
      return {
        practice: "English",
        native: "Ukrainian"
      };
    case "french":
      return {
        practice: "English",
        native: "French"
      };
    case "indonesian":
      return {
        practice: "English",
        native: "Indonesian"
      };
    case "turkish":
      return {
        practice: "English",
        native: "Turkish"
      };
    default:
      return {
        practice: "Spanish",
        native: "English"
      };
  }
};

/**
 * Returns the display name of a language in its native form
 * @param language The language code
 * @returns The native display name of the language
 */
export const getNativeLanguageDisplayName = (language: string): string => {
  const languageMap: Record<string, string> = {
    "english": "English",
    "spanish": "Español",
    "portuguese": "Português",
    "korean": "한국어",
    "arabic": "العربية",
    "mandarin": "中文",
    "vietnamese": "Tiếng Việt", 
    "french": "Français",
    "japanese": "日本語",
    "russian": "Русский",
    "ukrainian": "Українська",
    "hindi": "हिन्दी",
    "indonesian": "Bahasa Indonesia",
    "turkish": "Türkçe"
  };
  
  return languageMap[language.toLowerCase()] || language;
};
