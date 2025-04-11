
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
 * @returns Object with native and practice language names
 */
export const getLanguagePair = (currentLanguage: string) => {
  // Default case - English speakers learn Spanish
  let native = "English";
  let practice = "Spanish";
  
  // Non-English speakers typically learn English
  if (currentLanguage !== "english") {
    native = getLanguageDisplayName(currentLanguage);
    practice = "English";
  }
  
  return { native, practice };
};
