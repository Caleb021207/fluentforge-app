
/**
 * Languages that should always display translations (updated to only include well-supported languages)
 */
export const TRANSLATION_REQUIRED_LANGUAGES = [
  "hindi", 
  "japanese", 
  "french", 
  "russian", 
  "ukrainian",
  "indonesian",
  "korean",
  "arabic",
  "vietnamese",
  "mandarin",
  "bengali",
  "polish",
  "turkish",
  "tagalog",
  "german",
  "italian",
  "thai",
  "farsi"
];

/**
 * Get the target language for learning based on user's current language
 * @param currentLanguage User's current language setting
 * @returns The target language for learning
 */
export const getTargetLanguage = (currentLanguage: string): string => {
  return currentLanguage === "english" ? "spanish" : "english";
};

/**
 * Get the native language for the user
 * @param currentLanguage User's current language setting
 * @returns The user's native language
 */
export const getNativeLanguage = (currentLanguage: string): string => {
  return currentLanguage;
};
