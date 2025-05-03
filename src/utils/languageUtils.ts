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
