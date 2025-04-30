
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
  // Re-adding languages that were removed
  'haitian': 'ht-HT',
  'igbo': 'ig-NG',
  'bengali': 'bn-BD',
  'somali': 'so-SO',
  'yoruba': 'yo-NG',
  'amharic': 'am-ET',
  'malayalam': 'ml-IN',
  'polish': 'pl-PL',
  'turkish': 'tr-TR',
  'romanian': 'ro-RO'
};

// Meta MMS specific language codes (ISO 639-3)
export const metaMmsLanguageMap: Record<string, string> = {
  'haitian': 'hat',
  'igbo': 'ibo',
  'yoruba': 'yor',
  'somali': 'som',
  'bengali': 'ben',
  'amharic': 'amh',
  'malayalam': 'mal',
  // Add other languages supported by Meta MMS
};

// TTS cache constants
export const TTL_DURATION = 30 * 60 * 1000; // 30 minutes
export const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
