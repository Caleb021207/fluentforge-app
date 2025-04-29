
// Language code mappings for speech synthesis
export const languageCodeMap: Record<string, string> = {
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
  'indonesian': 'id-ID',
  'farsi': 'fa-IR',
  'urdu': 'ur-PK',
  'pashto': 'ps-AF',
  'swahili': 'sw-KE',
  // Adding new language codes
  'bengali': 'bn-BD',
  'somali': 'so-SO',
  'yoruba': 'yo-NG',
  'amharic': 'am-ET',
  'haitian': 'ht-HT',
  'malayalam': 'ml-IN',
  'igbo': 'ig-NG',
  'polish': 'pl-PL',
  'turkish': 'tr-TR',
  'romanian': 'ro-RO'
};

// TTS cache constants
export const TTL_DURATION = 30 * 60 * 1000; // 30 minutes
export const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
