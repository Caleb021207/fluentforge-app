
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
    'indonesian': 'Indonesian',
    'german': 'German',
    'italian': 'Italian'
  };
  
  return languageMap[language.toLowerCase()] || language;
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
    'indonesian': 'Bahasa Indonesia',
    'german': 'Deutsch',
    'italian': 'Italiano'
  };
  
  return nativeNameMap[language.toLowerCase()] || getLanguageDisplayName(language);
};

/**
 * Returns available target languages based on native language
 * @param nativeLanguage The user's native language
 * @returns Array of available target language codes
 */
export const getAvailableTargetLanguages = (nativeLanguage: string): string[] => {
  if (nativeLanguage.toLowerCase() !== 'english') {
    return ['english'];
  }
  
  // Active languages for English speakers
  const activeLanguages = ['spanish'];
  
  // Display these languages but mark them as under development
  const developmentLanguages = ['french', 'portuguese', 'german', 'italian'];
  
  return [...activeLanguages, ...developmentLanguages];
};

/**
 * Checks if a language is under development
 * @param language The language code to check
 * @returns Boolean indicating if the language is under development
 */
export const isLanguageUnderDevelopment = (language: string): boolean => {
  const developmentLanguages = ['french', 'portuguese', 'german', 'italian'];
  return developmentLanguages.includes(language.toLowerCase());
};

/**
 * Checks if study materials are available for a language pair
 * @param nativeLanguage The user's native language
 * @param targetLanguage The language the user wants to learn
 * @returns Boolean indicating if study materials are available
 */
export const hasStudyMaterials = (nativeLanguage: string, targetLanguage: string): boolean => {
  const supportedPairs = [
    'english-spanish',
    'english-french',
    'spanish-english',
    'portuguese-english',
    'french-english',
    'japanese-english',
    'korean-english',
    'mandarin-english',
    'russian-english',
    'arabic-english'
  ];
  
  const pairKey = `${nativeLanguage.toLowerCase()}-${targetLanguage.toLowerCase()}`;
  return supportedPairs.includes(pairKey);
};

/**
 * Convert language name to BCP 47 language tag for speech synthesis
 * @param language The language name (e.g., 'english', 'spanish')
 * @returns The BCP 47 language tag (e.g., 'en-US', 'es-ES')
 */
export const getLanguageCodeForSpeech = (language: string): string => {
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
    'indonesian': 'id-ID',
    'german': 'de-DE',
    'italian': 'it-IT'
  };
  
  return languageCodeMap[language.toLowerCase()] || 'en-US';
};

/**
 * Get the ISO 639-1 language code (2-letter code)
 * @param language The language name (e.g., 'english', 'spanish')
 * @returns The ISO 639-1 language code (e.g., 'en', 'es')
 */
export const getISOLanguageCode = (language: string): string => {
  const isoCodeMap: Record<string, string> = {
    'english': 'en',
    'spanish': 'es',
    'portuguese': 'pt',
    'french': 'fr',
    'japanese': 'ja',
    'korean': 'ko',
    'mandarin': 'zh',
    'russian': 'ru',
    'arabic': 'ar',
    'hindi': 'hi',
    'vietnamese': 'vi',
    'ukrainian': 'uk',
    'indonesian': 'id',
    'german': 'de',
    'italian': 'it'
  };
  
  return isoCodeMap[language.toLowerCase()] || 'en';
};
