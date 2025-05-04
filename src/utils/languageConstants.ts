
/**
 * Languages that should always display translations
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
  "urdu",
  "pashto",
  "swahili",
  "haitian",
  "igbo",
  "bengali",
  "somali",
  "yoruba",
  "amharic",
  "malayalam",
  "polish",
  "turkish",
  "romanian",
  "tagalog"  // Ensuring tagalog is explicitly included here
];

/**
 * Get the target language for learning based on user's current language
 * @param currentLanguage User's current language setting
 * @returns The target language for learning
 */
export const getTargetLanguage = (currentLanguage: string): string => {
  // Special case for Tagalog
  if (currentLanguage.toLowerCase() === "tagalog") {
    console.log("Tagalog user detected, setting target language to English");
    return "english";
  }
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
