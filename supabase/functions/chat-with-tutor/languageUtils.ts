// Language utilities for the chat-with-tutor function

// Get proper display name for a language
export function getLanguageDisplayName(language: string): string {
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
    'farsi': 'Farsi/Dari'
  };
  
  return languageMap[language.toLowerCase()] || language;
}

// Get the correct native language name based on user language
export function getUserNativeLanguage(userLanguage: string): string {
  const languageMap: Record<string, string> = {
    'english': 'English',
    'spanish': 'Spanish',
    'portuguese': 'Portuguese',
    'korean': 'Korean',
    'arabic': 'Arabic',
    'mandarin': 'Mandarin Chinese',
    'vietnamese': 'Vietnamese',
    'french': 'French',
    'japanese': 'Japanese',
    'ukrainian': 'Ukrainian',
    'russian': 'Russian',
    'hindi': 'Hindi',
    'indonesian': 'Indonesian',
    'farsi': 'Farsi/Dari'
  };
  
  return languageMap[userLanguage] || 'English';
}

// Determine language pair
export function determineLanguagePair(userLanguage: string, targetLang?: string) {
  // If both languages are specified, use them directly
  if (userLanguage && targetLang) {
    // English speaker learning another language
    if (userLanguage.toLowerCase() === 'english') {
      return {
        isLearningEnglish: false,
        targetLanguage: getLanguageDisplayName(targetLang),
        nativeLanguage: 'English'
      };
    }
    
    // Non-English speaker learning English
    if (targetLang.toLowerCase() === 'english') {
      return {
        isLearningEnglish: true,
        targetLanguage: 'English',
        nativeLanguage: getUserNativeLanguage(userLanguage)
      };
    }
    
    // Fallback for other combinations
    return {
      isLearningEnglish: false,
      targetLanguage: getLanguageDisplayName(targetLang),
      nativeLanguage: getUserNativeLanguage(userLanguage)
    };
  }
  
  // Legacy behavior for backward compatibility
  const isLearningEnglish = userLanguage !== 'english';
  const learnLanguage = isLearningEnglish ? 'English' : 'Spanish';
  const nativeLanguage = getUserNativeLanguage(userLanguage);
  
  return { isLearningEnglish, targetLanguage: learnLanguage, nativeLanguage };
}

// Helper function to check if text contains Devanagari script (Hindi)
export function containsDevanagariScript(text: string): boolean {
  // Devanagari Unicode range: U+0900 to U+097F
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text);
}

// Helper function to check if text contains Farsi script
export function containsFarsiScript(text: string): boolean {
  // Farsi Unicode range: U+0600 to U+06FF (Arabic, which includes Farsi)
  const farsiRegex = /[\u0600-\u06FF]/;
  return farsiRegex.test(text);
}
