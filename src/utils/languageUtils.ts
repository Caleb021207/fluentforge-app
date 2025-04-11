
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
 * Returns available target languages based on native language
 * @param nativeLanguage The user's native language
 * @returns Array of available target language codes
 */
export const getAvailableTargetLanguages = (nativeLanguage: string): string[] => {
  if (nativeLanguage.toLowerCase() !== 'english') {
    return ['english'];
  }
  
  // Updated to include Portuguese for English speakers
  const commonLanguages = ['spanish', 'french', 'portuguese', 'japanese', 'mandarin'];
  
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
    'arabic-english'
  ];
  
  const pairKey = `${nativeLanguage?.toLowerCase() || ''}-${targetLanguage?.toLowerCase() || ''}`;
  return supportedPairs.includes(pairKey);
};

/**
 * Returns the browser speech synthesis language code for a language
 * @param language The language name (english, spanish, etc.)
 * @returns The language code for speech synthesis (en-US, es-ES, etc.)
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

/**
 * Finds the best available voice for a given language
 * @param synthRef The speech synthesis instance
 * @param langCode The language code (e.g., en-US, es-ES)
 * @returns The best matching voice or undefined if none found
 */
export const findBestVoiceForLanguage = (
  synthRef: SpeechSynthesis, 
  langCode: string
): SpeechSynthesisVoice | undefined => {
  if (!synthRef) {
    console.error("Speech synthesis reference is undefined");
    return undefined;
  }
  
  const voices = synthRef.getVoices();
  if (!voices || voices.length === 0) {
    console.warn("No voices available in speech synthesis");
    return undefined;
  }
  
  const languagePrefix = langCode.split('-')[0].toLowerCase();
  console.log(`Finding voice for language code: ${langCode}, prefix: ${languagePrefix}, available voices: ${voices.length}`);
  
  // Log available voices for debugging
  voices.forEach(v => {
    console.log(`Voice: ${v.name}, Lang: ${v.lang}, Default: ${v.default}`);
  });
  
  // Try to find an exact match first
  let voice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
  if (voice) {
    console.log(`Found exact match voice: ${voice.name}`);
    return voice;
  }
  
  // If no exact match, try to find a voice that starts with the language code
  voice = voices.find(v => v.lang.toLowerCase().startsWith(languagePrefix));
  if (voice) {
    console.log(`Found prefix match voice: ${voice.name}`);
    return voice;
  }
  
  // If still no match, use any voice that contains the language code
  voice = voices.find(v => v.lang.toLowerCase().includes(languagePrefix));
  if (voice) {
    console.log(`Found partial match voice: ${voice.name}`);
    return voice;
  }
  
  // Try to find any default voice as a last resort
  voice = voices.find(v => v.default === true);
  if (voice) {
    console.log(`Using default voice as fallback: ${voice.name}`);
    return voice;
  }
  
  // If all else fails, return the first available voice
  if (voices.length > 0) {
    console.log(`Using first available voice as fallback: ${voices[0].name}`);
    return voices[0];
  }
  
  console.warn(`No voice found for language: ${langCode}`);
  return undefined;
};
