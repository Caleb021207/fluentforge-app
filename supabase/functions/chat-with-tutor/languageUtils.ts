
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
    'cantonese': 'Cantonese', // Added Cantonese
    'russian': 'Russian',
    'arabic': 'Arabic',
    'hindi': 'Hindi',
    'vietnamese': 'Vietnamese',
    'ukrainian': 'Ukrainian',
    'indonesian': 'Indonesian',
    'farsi': 'Farsi/Dari',
    'urdu': 'Urdu',
    'pashto': 'Pashto',
    'swahili': 'Swahili',
    // Adding new languages
    'bengali': 'Bengali',
    'somali': 'Somali',
    'yoruba': 'Yoruba',
    'amharic': 'Amharic',
    'haitian': 'Haitian Creole',
    'malayalam': 'Malayalam',
    'igbo': 'Igbo',
    'polish': 'Polish',
    'turkish': 'Turkish',
    'romanian': 'Romanian',
    'tagalog': 'Filipino/Tagalog',
    'german': 'German',
    'italian': 'Italian',
    'thai': 'Thai',
    'gujarati': 'Gujarati',
    'punjabi': 'Punjabi',
    'nepali': 'Nepali'
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
    'cantonese': 'Cantonese', 
    'vietnamese': 'Vietnamese',
    'french': 'French',
    'japanese': 'Japanese',
    'ukrainian': 'Ukrainian',
    'russian': 'Russian',
    'hindi': 'Hindi',
    'indonesian': 'Indonesian',
    'farsi': 'Farsi/Dari',
    'urdu': 'Urdu',
    'pashto': 'Pashto',
    'swahili': 'Swahili',
    'bengali': 'Bengali',
    'somali': 'Somali',
    'yoruba': 'Yoruba',
    'amharic': 'Amharic',
    'haitian': 'Haitian Creole',
    'malayalam': 'Malayalam',
    'igbo': 'Igbo',
    'polish': 'Polish',
    'turkish': 'Turkish',
    'romanian': 'Romanian',
    'tagalog': 'Filipino/Tagalog',
    'german': 'German',
    'italian': 'Italian',
    'thai': 'Thai',
    'gujarati': 'Gujarati',
    'punjabi': 'Punjabi',
    'nepali': 'Nepali'
  };
  
  return languageMap[userLanguage.toLowerCase()] || 'English';
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

// Helper function to check if text contains Bengali script
export function containsBengaliScript(text: string): boolean {
  // Bengali Unicode range: U+0980 to U+09FF
  const bengaliRegex = /[\u0980-\u09FF]/;
  return bengaliRegex.test(text);
}

// Helper function to check if text contains Chinese script (used by both Mandarin and Cantonese)
export function containsChineseScript(text: string): boolean {
  // Chinese characters Unicode ranges
  const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/;
  return chineseRegex.test(text);
}

// Helper function to check if text contains Amharic script
export function containsAmharicScript(text: string): boolean {
  // Amharic Unicode range: U+1200 to U+137F (Ethiopic)
  const amharicRegex = /[\u1200-\u137F]/;
  return amharicRegex.test(text);
}

// Helper function to check if text contains Malayalam script
export function containsMalayalamScript(text: string): boolean {
  // Malayalam Unicode range: U+0D00 to U+0D7F
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  return malayalamRegex.test(text);
}

// Helper function to check if text contains substantial Latin script (to detect mixed language)
export function containsSubstantialLatinScript(text: string): boolean {
  // This regex looks for sequences of 4 or more Latin characters, which would indicate
  // significant Latin script content that would be inappropriate for Chinese languages
  const substantialLatinRegex = /[a-zA-Z]{4,}/;
  return substantialLatinRegex.test(text);
}

// Helper function to verify if text is proper Cantonese with Traditional Chinese characters
export function isProperCantonese(text: string): boolean {
  // Must contain Chinese characters
  if (!containsChineseScript(text)) {
    return false;
  }
  
  // Must not contain substantial Latin text (which would indicate mixed language)
  if (containsSubstantialLatinScript(text)) {
    return false;
  }
  
  // Check for minimum length to be considered valid
  if (text.length < 10) {
    return false;
  }
  
  return true;
}
