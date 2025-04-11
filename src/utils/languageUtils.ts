/**
 * Returns information about language pairs based on user's interface language
 * For language learning, we need to know which language the user is practicing
 * and which language they are learning
 */
export const getLanguagePair = (currentLanguage: string, targetLanguage?: string) => {
  // Default language pairs with English translations
  // When a user selects a native language, we determine which language
  // they are learning (practicing) based on this configuration
  
  const normalizedLanguage = currentLanguage.toLowerCase();
  
  // If English speaker with explicit target language
  if (normalizedLanguage === "english" && targetLanguage) {
    return {
      practice: getLanguageDisplayName(targetLanguage),
      native: "English"
    };
  }
  
  // Default pairings for different native languages
  switch (normalizedLanguage) {
    case "english":
      return {
        practice: "Spanish", // Default: English speakers learn Spanish
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
    default:
      return {
        practice: "Spanish",
        native: "English"
      };
  }
};

/**
 * Returns the display name of a language
 * @param language The language code
 * @returns The display name of the language
 */
export const getLanguageDisplayName = (language: string): string => {
  const languageMap: Record<string, string> = {
    "english": "English",
    "spanish": "Spanish",
    "portuguese": "Portuguese",
    "korean": "Korean",
    "arabic": "Arabic",
    "mandarin": "Mandarin",
    "vietnamese": "Vietnamese", 
    "french": "French",
    "japanese": "Japanese",
    "russian": "Russian",
    "ukrainian": "Ukrainian",
    "hindi": "Hindi",
    "indonesian": "Indonesian"
  };
  
  return languageMap[language.toLowerCase()] || language;
};

/**
 * Returns the native display name of a language
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
    "indonesian": "Bahasa Indonesia"
  };
  
  return languageMap[language.toLowerCase()] || language;
};

/**
 * Returns the OpenAI Whisper API language code for a given language
 * @param language The language name
 * @returns ISO language code used by Whisper API
 */
export const getWhisperLanguageCode = (language: string): string => {
  const languageCodeMap: Record<string, string> = {
    'english': 'en',
    'spanish': 'es',
    'portuguese': 'pt',
    'french': 'fr',
    'mandarin': 'zh',
    'arabic': 'ar',
    'japanese': 'ja',
    'korean': 'ko',
    'russian': 'ru',
    'ukrainian': 'uk',
    'vietnamese': 'vi',
    'indonesian': 'id',
    'hindi': 'hi'
  };
  
  return languageCodeMap[language.toLowerCase()] || 'en';
};

/**
 * Returns the Web Speech API language code for a given language
 * @param language The language name
 * @returns BCP 47 language tag used by Web Speech API
 */
export const getSpeechRecognitionLanguageCode = (language: string): string => {
  const languageCodeMap: Record<string, string> = {
    'english': 'en-US',
    'spanish': 'es-ES',
    'portuguese': 'pt-PT',
    'french': 'fr-FR',
    'mandarin': 'zh-CN',
    'arabic': 'ar-SA',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'russian': 'ru-RU',
    'ukrainian': 'uk-UA',
    'vietnamese': 'vi-VN',
    'indonesian': 'id-ID',
    'hindi': 'hi-IN'
  };
  
  return languageCodeMap[language.toLowerCase()] || 'en-US';
};

/**
 * Checks if text contains characters from specific scripts
 * @param text The text to check
 * @param script The script to check for (devanagari, cyrillic, etc.)
 * @returns Boolean indicating if text contains characters from the script
 */
export const containsScript = (text: string, script: string): boolean => {
  if (!text) return false;
  
  const scriptRanges: Record<string, RegExp> = {
    devanagari: /[\u0900-\u097F]/,  // Hindi
    cyrillic: /[\u0400-\u04FF]/,    // Russian, Ukrainian
    arabic: /[\u0600-\u06FF]/,      // Arabic
    han: /[\u4E00-\u9FFF]/,         // Chinese
    hangul: /[\uAC00-\uD7AF]/,      // Korean
    hiragana: /[\u3040-\u309F]/,    // Japanese
    katakana: /[\u30A0-\u30FF]/,    // Japanese
  };
  
  return scriptRanges[script.toLowerCase()]?.test(text) || false;
};

/**
 * Checks if a language has study materials available
 * @param nativeLanguage The native language
 * @param targetLanguage The target language to learn
 * @returns Boolean indicating if study materials are available
 */
export const hasStudyMaterials = (nativeLanguage: string, targetLanguage: string): boolean => {
  // English speakers learning any supported language
  if (nativeLanguage.toLowerCase() === "english") {
    const supportedTargets = ["spanish", "french", "portuguese", "mandarin", "japanese", "korean", "russian"];
    return supportedTargets.includes(targetLanguage.toLowerCase());
  }
  
  // Non-English speakers learning English
  if (targetLanguage.toLowerCase() === "english") {
    const supportedNatives = [
      "spanish", "portuguese", "french", "mandarin", "japanese", 
      "korean", "russian", "ukrainian", "arabic", "vietnamese", 
      "hindi", "indonesian"
    ];
    return supportedNatives.includes(nativeLanguage.toLowerCase());
  }
  
  // Default to false for unsupported combinations
  return false;
};

/**
 * Gets the list of languages that can be learned from a given native language
 * @param nativeLanguage The native language
 * @returns Array of language codes that can be learned
 */
export const getAvailableTargetLanguages = (nativeLanguage: string): string[] => {
  if (nativeLanguage.toLowerCase() === "english") {
    // English speakers can learn these languages
    return ["spanish", "french", "portuguese", "mandarin", "japanese", "korean", "russian"];
  }
  
  // Non-English speakers can only learn English for now
  return ["english"];
};
