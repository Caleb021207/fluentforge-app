
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
    'farsi': 'Farsi/Dari',
    'urdu': 'Urdu',
    'pashto': 'Pashto',
    'swahili': 'Swahili'
  };
  
  return languageMap[language?.toLowerCase()] || language || 'English';
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
    'farsi': 'فارسی',
    'urdu': 'اردو',
    'pashto': 'پښتو',
    'swahili': 'Kiswahili'
  };
  
  return nativeNameMap[language?.toLowerCase()] || getLanguageDisplayName(language);
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
  
  // Updated to only include Spanish and French for English speakers
  const commonLanguages = ['spanish', 'french'];
  
  return commonLanguages;
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
    'english-portuguese', // Added Portuguese support for English speakers
    'spanish-english',
    'portuguese-english',
    'french-english',
    'japanese-english',
    'korean-english',
    'mandarin-english',
    'russian-english',
    'arabic-english',
    'hindi-english',      // Adding Hindi
    'vietnamese-english', // Adding Vietnamese
    'ukrainian-english',  // Adding Ukrainian
    'indonesian-english', // Adding Indonesian
    'farsi-english',      // Adding Farsi/Dari
    'english-farsi',      // English speakers learning Farsi
    'urdu-english',       // Urdu speakers learning English
    'pashto-english'      // Pashto speakers learning English
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
    'indonesian': 'id-ID',
    'farsi': 'fa-IR',
    'urdu': 'ur-PK',
    'pashto': 'ps-AF',
    'swahili': 'sw-KE'
  };
  
  return languageCodeMap[language?.toLowerCase()] || 'en-US';
};
