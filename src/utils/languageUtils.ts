/**
 * Returns display name for a language code
 * @param language The language code
 * @returns The proper display name for the language
 */
export const getLanguageDisplayName = (language: string): string => {
  const languageMap: Record<string, string> = {
    'english': 'English',
    'spanish': 'Spanish',
    'portuguese': 'Portuguese',
    'french': 'French',
    'japanese': 'Japanese',
    'korean': 'Korean',
    'mandarin': 'Mandarin Chinese',
    'russian': 'Russian',
    'arabic': 'Arabic',
    'hindi': 'Hindi',
    'vietnamese': 'Vietnamese',
    'ukrainian': 'Ukrainian',
    'indonesian': 'Indonesian'
  };
  
  return languageMap[language?.toLowerCase()] || language || 'English';
};

/**
 * Returns language pair object from combined language pair string
 * @param languagePair The combined language pair string (e.g. "english-for-spanish")
 * @returns Object with native and practice language names
 */
export const parseLanguagePair = (languagePair: string) => {
  let native = "English";
  let practice = "Spanish";
  
  if (languagePair) {
    if (languagePair === "english-for-spanish") {
      native = "English";
      practice = "Spanish";
    } else if (languagePair === "english-for-french") {
      native = "English";
      practice = "French";
    } else if (languagePair === "english-for-portuguese") {
      native = "English";
      practice = "Portuguese";
    } else if (languagePair === "english-for-japanese") {
      native = "English";
      practice = "Japanese";
    } else if (languagePair === "english-for-mandarin") {
      native = "English";
      practice = "Mandarin Chinese";
    } else if (languagePair === "spanish-for-english") {
      native = "Spanish";
      practice = "English";
    } else if (languagePair === "portuguese-for-english") {
      native = "Portuguese";
      practice = "English";
    } else if (languagePair === "french-for-english") {
      native = "French";
      practice = "English";
    } else if (languagePair === "japanese-for-english") {
      native = "Japanese";
      practice = "English";
    } else if (languagePair === "korean-for-english") {
      native = "Korean";
      practice = "English";
    } else if (languagePair === "mandarin-for-english") {
      native = "Mandarin Chinese";
      practice = "English";
    } else if (languagePair === "russian-for-english") {
      native = "Russian";
      practice = "English";
    } else if (languagePair === "arabic-for-english") {
      native = "Arabic";
      practice = "English";
    } else if (languagePair === "hindi-for-english") {
      native = "Hindi";
      practice = "English";
    } else if (languagePair === "vietnamese-for-english") {
      native = "Vietnamese";
      practice = "English";
    } else if (languagePair === "ukrainian-for-english") {
      native = "Ukrainian";
      practice = "English";
    } else if (languagePair === "indonesian-for-english") {
      native = "Indonesian";
      practice = "English";
    }
  }
  
  return { native, practice };
};

/**
 * Returns native and practice language pair based on user's selected language
 * @param currentLanguage The user's current UI language
 * @returns Object with native and practice language names
 */
export const getLanguagePair = (currentLanguage: string) => {
  let native = "English";
  let practice = "Spanish";
  
  if (currentLanguage !== "english") {
    native = getLanguageDisplayName(currentLanguage);
    practice = "English";
  }
  
  return { native, practice };
};

/**
 * Returns the native language display name in its native script
 * @param language The language code
 * @returns The native display name for the language
 */
export const getNativeLanguageDisplayName = (language: string): string => {
  const nativeNameMap: Record<string, string> = {
    'english': 'English',
    'spanish': 'Español',
    'portuguese': 'Português',
    'french': 'Français',
    'japanese': '日本語',
    'korean': '한국어',
    'mandarin': '中文',
    'russian': 'Русский',
    'arabic': 'العربية',
    'hindi': 'हिन्दी',
    'vietnamese': 'Tiếng Việt',
    'ukrainian': 'Українська',
    'indonesian': 'Bahasa Indonesia'
  };
  
  return nativeNameMap[language?.toLowerCase()] || getLanguageDisplayName(language);
};

/**
 * Returns available language pairs based on current system support
 * @returns Array of available language pair objects
 */
export const getAvailableLanguagePairs = (): { id: string, name: string, flag: string }[] => {
  return [
    { id: "english-for-spanish", name: "English for Spanish", flag: "🇺🇸→🇪🇸" },
    { id: "english-for-french", name: "English for French", flag: "🇺🇸→🇫🇷" },
    { id: "english-for-portuguese", name: "English for Portuguese", flag: "🇺🇸→🇧🇷" },
    { id: "english-for-japanese", name: "English for Japanese", flag: "🇺🇸→🇯🇵" },
    { id: "english-for-mandarin", name: "English for Mandarin", flag: "🇺🇸→🇨🇳" },
    { id: "spanish-for-english", name: "Spanish for English", flag: "🇪🇸→🇺🇸" },
    { id: "portuguese-for-english", name: "Portuguese for English", flag: "🇧🇷→🇺🇸" },
    { id: "french-for-english", name: "French for English", flag: "🇫🇷→🇺🇸" },
    { id: "japanese-for-english", name: "Japanese for English", flag: "🇯🇵→🇺🇸" },
    { id: "korean-for-english", name: "Korean for English", flag: "🇰🇷→🇺🇸" },
    { id: "mandarin-for-english", name: "Mandarin for English", flag: "🇨🇳→🇺🇸" },
    { id: "russian-for-english", name: "Russian for English", flag: "🇷🇺→🇺🇸" },
    { id: "arabic-for-english", name: "Arabic for English", flag: "🇸🇦→🇺🇸" },
    { id: "hindi-for-english", name: "Hindi for English", flag: "🇮🇳→🇺🇸" },
    { id: "vietnamese-for-english", name: "Vietnamese for English", flag: "🇻🇳→🇺🇸" },
    { id: "ukrainian-for-english", name: "Ukrainian for English", flag: "🇺🇦→🇺🇸" },
    { id: "indonesian-for-english", name: "Indonesian for English", flag: "🇮🇩→🇺🇸" },
  ];
};

/**
 * Extracts native and target languages from a language pair
 * @param languagePair The language pair string (e.g. "english-for-spanish")
 * @returns Object with native and target language codes
 */
export const extractLanguagesFromPair = (languagePair: string): { nativeLanguage: string, targetLanguage: string } => {
  const parts = languagePair.split('-for-');
  return {
    nativeLanguage: parts[0] || 'english',
    targetLanguage: parts[1] || 'spanish'
  };
};

/**
 * Checks if study materials are available for a language pair
 * @param languagePair The language pair string (e.g. "english-for-spanish")
 * @returns Boolean indicating if study materials are available
 */
export const hasStudyMaterialsForPair = (languagePair: string): boolean => {
  const { nativeLanguage, targetLanguage } = extractLanguagesFromPair(languagePair);
  
  const supportedPairs = [
    'english-spanish',
    'english-french',
    'english-portuguese',
    'spanish-english',
    'portuguese-english',
    'french-english',
    'japanese-english',
    'korean-english',
    'mandarin-english',
    'russian-english',
    'arabic-english'
  ];
  
  const pairKey = `${nativeLanguage?.toLowerCase() || ''}-${targetLanguage?.toLowerCase() || ''}`;
  return supportedPairs.includes(pairKey);
};

/**
 * Maintain backward compatibility for hasStudyMaterials
 */
export const hasStudyMaterials = (nativeLanguage: string, targetLanguage: string): boolean => {
  const supportedPairs = [
    'english-spanish',
    'english-french',
    'english-portuguese',
    'spanish-english',
    'portuguese-english',
    'french-english',
    'japanese-english',
    'korean-english',
    'mandarin-english',
    'russian-english',
    'arabic-english'
  ];
  
  const pairKey = `${nativeLanguage?.toLowerCase() || ''}-${targetLanguage?.toLowerCase() || ''}`;
  return supportedPairs.includes(pairKey);
};

/**
 * Returns the language code for a language
 * @param language The language name (english, spanish, etc.)
 * @returns The language code (en-US, es-ES, etc.)
 */
export const getSpeechSynthesisLanguageCode = (language: string): string => {
  const languageCodeMap: Record<string, string> = {
    'english': 'en-US',
    'spanish': 'es-ES',
    'portuguese': 'pt-BR',
    'french': 'fr-FR',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'mandarin': 'zh-CN',
    'russian': 'ru-RU',
    'arabic': 'ar-SA',
    'hindi': 'hi-IN',
    'vietnamese': 'vi-VN',
    'ukrainian': 'uk-UA',
    'indonesian': 'id-ID'
  };
  
  return languageCodeMap[language?.toLowerCase()] || 'en-US';
};
