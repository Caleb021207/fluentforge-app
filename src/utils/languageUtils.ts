
// Helper function to get language pairs (native language and practice language)
export const getLanguagePair = (currentLanguage: string) => {
  // Default to English if no language is provided
  if (!currentLanguage) {
    return { native: "english", practice: "spanish" };
  }

  // Static mapping for language pairs based on user's interface language
  const languagePairs: Record<string, { native: string; practice: string }> = {
    english: { native: "english", practice: "spanish" },
    spanish: { native: "spanish", practice: "english" },
    portuguese: { native: "portuguese", practice: "english" },
    korean: { native: "korean", practice: "english" },
    arabic: { native: "arabic", practice: "english" },
    mandarin: { native: "mandarin", practice: "english" },
    vietnamese: { native: "vietnamese", practice: "english" },
    french: { native: "french", practice: "english" },
    japanese: { native: "japanese", practice: "english" },
    russian: { native: "russian", practice: "english" },
    ukrainian: { native: "ukrainian", practice: "english" },
    hindi: { native: "hindi", practice: "english" },
    indonesian: { native: "indonesian", practice: "english" },
    farsi: { native: "farsi", practice: "english" },
    urdu: { native: "urdu", practice: "english" },
    pashto: { native: "pashto", practice: "english" },
    swahili: { native: "swahili", practice: "english" },
    bengali: { native: "bengali", practice: "english" },
    somali: { native: "somali", practice: "english" },
    yoruba: { native: "yoruba", practice: "english" },
    amharic: { native: "amharic", practice: "english" },
    malayalam: { native: "malayalam", practice: "english" },
    haitian: { native: "haitian", practice: "english" },
    igbo: { native: "igbo", practice: "english" },
    polish: { native: "polish", practice: "english" },
    turkish: { native: "turkish", practice: "english" },
    romanian: { native: "romanian", practice: "english" },
    tagalog: { native: "tagalog", practice: "english" }
  };

  // Return the language pair or default if not found
  return languagePairs[currentLanguage] || { native: "english", practice: "spanish" };
};

// Helper to get language code for speech synthesis
export const getSpeechSynthesisLanguageCode = (language: string): string => {
  const languageCodes: Record<string, string> = {
    english: "en-US",
    spanish: "es-ES",
    portuguese: "pt-PT",
    korean: "ko-KR",
    arabic: "ar-SA",
    mandarin: "zh-CN",
    vietnamese: "vi-VN",
    french: "fr-FR",
    japanese: "ja-JP",
    russian: "ru-RU",
    ukrainian: "uk-UA",
    hindi: "hi-IN",
    indonesian: "id-ID",
    farsi: "fa-IR",
    urdu: "ur-PK",
    pashto: "ps",
    swahili: "sw-KE",
    bengali: "bn-IN",
    somali: "so-SO",
    yoruba: "yo",
    amharic: "am-ET",
    malayalam: "ml-IN",
    haitian: "ht",
    igbo: "ig-NG",
    polish: "pl-PL",
    turkish: "tr-TR",
    romanian: "ro-RO",
    tagalog: "fil-PH"
  };

  return languageCodes[language] || "en-US";
};

// Function to determine if the current environment is the client-side
export const isClientSide = (): boolean => {
  return typeof window !== 'undefined';
};

// Function to get the user's preferred language from localStorage
export const getPreferredLanguage = (): string => {
  if (isClientSide()) {
    return localStorage.getItem('preferredLanguage') || 'english';
  }
  return 'english';
};

// Get the display name for a language
export const getLanguageDisplayName = (language: string): string => {
  const displayNames: Record<string, string> = {
    english: "English",
    spanish: "Spanish",
    portuguese: "Portuguese",
    korean: "Korean",
    arabic: "Arabic",
    mandarin: "Mandarin Chinese",
    vietnamese: "Vietnamese",
    french: "French",
    japanese: "Japanese",
    russian: "Russian",
    ukrainian: "Ukrainian",
    hindi: "Hindi",
    indonesian: "Indonesian",
    farsi: "Farsi",
    urdu: "Urdu",
    pashto: "Pashto",
    swahili: "Swahili",
    bengali: "Bengali",
    somali: "Somali",
    yoruba: "Yoruba",
    amharic: "Amharic",
    malayalam: "Malayalam",
    haitian: "Haitian Creole",
    igbo: "Igbo",
    polish: "Polish",
    turkish: "Turkish",
    romanian: "Romanian",
    tagalog: "Tagalog"
  };

  return displayNames[language.toLowerCase()] || language;
};

// Get available target languages based on native language
export const getAvailableTargetLanguages = (nativeLanguage: string): string[] => {
  if (!nativeLanguage) return [];

  // English speakers can learn many languages
  if (nativeLanguage.toLowerCase() === 'english') {
    return [
      'spanish', 'portuguese', 'french', 'mandarin', 'japanese',
      'korean', 'arabic', 'vietnamese', 'russian', 'ukrainian',
      'hindi', 'indonesian', 'farsi', 'urdu', 'pashto',
      'swahili', 'bengali', 'somali', 'yoruba', 'amharic',
      'malayalam', 'haitian', 'igbo', 'polish', 'turkish',
      'romanian', 'tagalog'
    ];
  }
  
  // Non-English speakers primarily learn English
  return ['english'];
};

// Get the native language display name in its native script
export const getNativeLanguageDisplayName = (language: string): string => {
  const nativeNames: Record<string, string> = {
    english: "English",
    spanish: "Español",
    portuguese: "Português",
    korean: "한국어",
    arabic: "العربية",
    mandarin: "中文",
    vietnamese: "Tiếng Việt",
    french: "Français",
    japanese: "日本語",
    russian: "Русский",
    ukrainian: "Українська",
    hindi: "हिन्दी",
    indonesian: "Bahasa Indonesia",
    farsi: "فارسی",
    urdu: "اردو",
    pashto: "پښتو",
    swahili: "Kiswahili",
    bengali: "বাংলা",
    somali: "Soomaali",
    yoruba: "Yorùbá",
    amharic: "አማርኛ",
    malayalam: "മലയാളം",
    haitian: "Kreyòl Ayisyen",
    igbo: "Igbo",
    polish: "Polski",
    turkish: "Türkçe",
    romanian: "Română",
    tagalog: "Tagalog"
  };

  return nativeNames[language.toLowerCase()] || language;
};

// Check if study materials are available for a language pair
export const hasStudyMaterials = (nativeLanguage: string, targetLanguage: string): boolean => {
  // Most comprehensive materials exist for English speakers learning other languages
  if (nativeLanguage.toLowerCase() === 'english') {
    return true;
  }
  
  // Materials for speakers of other languages learning English
  if (targetLanguage.toLowerCase() === 'english') {
    return true;
  }
  
  // Special cases where non-English to non-English materials exist
  const specialPairs = [
    'spanish-french',
    'spanish-portuguese',
    'portuguese-spanish'
  ];

  const pair = `${nativeLanguage.toLowerCase()}-${targetLanguage.toLowerCase()}`;
  return specialPairs.includes(pair);
};
