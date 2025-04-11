
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
  
  return languageMap[language.toLowerCase()] || language;
};

/**
 * Returns native and practice language pair based on user's selected language
 * @param currentLanguage The user's current UI language
 * @param specifiedTargetLanguage Optional specified target language
 * @returns Object with native and practice language names
 */
export const getLanguagePair = (currentLanguage: string, specifiedTargetLanguage?: string) => {
  let native = "English";
  let practice = "Spanish";
  
  if (currentLanguage === "english") {
    // If a specific target language is provided, use it
    if (specifiedTargetLanguage) {
      practice = getLanguageDisplayName(specifiedTargetLanguage);
    } else {
      // Otherwise default to the first available language
      const availableTargets = getAvailableTargetLanguages("english");
      practice = getLanguageDisplayName(availableTargets[0] || "spanish");
    }
  } else if (currentLanguage !== "english") {
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
  
  // Updated to include Spanish, Portuguese, and French for English speakers
  const commonLanguages = ['spanish', 'french', 'portuguese'];
  
  return commonLanguages;
};

/**
 * Checks if study materials are available for a language pair
 * @param nativeLanguage The user's native language
 * @param targetLanguage The language the user wants to learn
 * @returns Boolean indicating if study materials are available
 */
export const hasStudyMaterials = (nativeLanguage: string, targetLanguage: string): boolean => {
  // Updated to include all available language pairs in the application
  const supportedPairs = [
    'english-spanish',
    'english-french',
    'english-portuguese',
    'spanish-english',
    'portuguese-english',
    'french-english', // Explicitly adding French-English support
    'japanese-english',
    'korean-english',
    'mandarin-english',
    'russian-english',
    'arabic-english',
    'vietnamese-english',
    'ukrainian-english',
    'indonesian-english',
    'hindi-english'
  ];
  
  const pairKey = `${nativeLanguage.toLowerCase()}-${targetLanguage.toLowerCase()}`;
  return supportedPairs.includes(pairKey);
};

/**
 * Determines if the user is learning towards or from English
 * @param nativeLanguage The user's native language
 * @param targetLanguage The language the user wants to learn
 * @returns String indicating the learning direction: 'to-english', 'from-english', or null
 */
export const getLearningDirection = (nativeLanguage: string, targetLanguage: string): 'to-english' | 'from-english' | null => {
  const normalizedNative = nativeLanguage.toLowerCase();
  const normalizedTarget = targetLanguage.toLowerCase();
  
  if (normalizedNative === 'english' && normalizedTarget !== 'english') {
    return 'from-english';
  } else if (normalizedNative !== 'english' && normalizedTarget === 'english') {
    return 'to-english';
  }
  return null;
};

/**
 * Determines the appropriate route based on user's language settings
 * @param nativeLanguage The user's native language
 * @param targetLanguage The language the user wants to learn
 * @returns String representing the route path
 */
export const getVoiceChatRoute = (nativeLanguage: string, targetLanguage: string): string => {
  const direction = getLearningDirection(nativeLanguage, targetLanguage);
  const normalizedTarget = targetLanguage.toLowerCase();
  const normalizedNative = nativeLanguage.toLowerCase();
  
  if (direction === 'from-english') {
    // English speaker learning another language
    if (normalizedTarget === 'french') {
      return '/learn-french';
    } else if (normalizedTarget === 'portuguese') {
      return '/learn-portuguese';
    } else {
      return '/voice-chat'; // Default for other languages
    }
  } else if (direction === 'to-english') {
    // Non-English speaker learning English
    if (normalizedNative === 'french') {
      return '/french-voice-chat';
    } else if (normalizedNative === 'portuguese') {
      return '/portuguese-voice-chat';
    } else {
      return '/voice-chat'; // Default for other languages
    }
  }
  
  return '/voice-chat'; // Default fallback
};
