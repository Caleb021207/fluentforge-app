
/**
 * Checks if speech recognition is supported in the current browser
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Creates a new speech recognition instance if supported
 */
export const createSpeechRecognition = (): SpeechRecognition | null => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }
  
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  return new SpeechRecognitionAPI();
};

/**
 * Gets the appropriate language code for speech recognition
 * based on the language name
 */
export const getSpeechRecognitionLanguage = (language: string): string => {
  const languageMap: Record<string, string> = {
    'english': 'en-US',
    'spanish': 'es-ES',
    'french': 'fr-FR',
    'portuguese': 'pt-PT',
    'german': 'de-DE',
    'italian': 'it-IT',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'mandarin': 'zh-CN',
    'cantonese': 'zh-HK',
    'russian': 'ru-RU',
    'arabic': 'ar-SA',
    'hindi': 'hi-IN',
    'vietnamese': 'vi-VN',
    'turkish': 'tr-TR',
    'polish': 'pl-PL',
    'ukrainian': 'uk-UA',
    'romanian': 'ro-RO',
    'thai': 'th-TH',
    'indonesian': 'id-ID',
    'malay': 'ms-MY',
    'tagalog': 'fil-PH',
    'swahili': 'sw-KE',
    'yoruba': 'yo-NG',
    'igbo': 'ig-NG',
    'haitian': 'ht',
    'bengali': 'bn-IN',
    'urdu': 'ur-PK',
    'pashto': 'ps-AF',
    'farsi': 'fa-IR',
    'amharic': 'am-ET',
    'somali': 'so-SO'
  };
  
  // Default to English if language not found
  return languageMap[language.toLowerCase()] || 'en-US';
};

/**
 * Convert browser speech recognition error codes to user-friendly messages
 */
export const getSpeechRecognitionErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'not-allowed': 'Microphone access denied. Please check your browser permissions.',
    'audio-capture': 'No microphone was found. Ensure that a microphone is installed.',
    'network': 'Network error occurred. Please check your connection.',
    'aborted': 'Speech recognition was aborted.',
    'no-speech': 'No speech was detected. Please try again.',
    'language-not-supported': 'The language is not supported.',
    'service-not-allowed': 'The speech recognition service is not allowed.',
    'bad-grammar': 'There was an error in the speech grammar.',
    'permission-denied': 'Microphone permission was denied.',
    'not-supported': 'Speech recognition is not supported in this browser.'
  };
  
  return errorMessages[errorCode] || `Unknown error: ${errorCode}`;
};
