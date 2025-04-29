
// Language and voice mapping configurations

// Language code mapping with information about which TTS service to use
export const languageVoiceMap: Record<string, { languageCode: string, voiceName: string }> = {
  "english": { languageCode: "en-US", voiceName: "en-US-JennyNeural" },
  "spanish": { languageCode: "es-ES", voiceName: "es-ES-AlvaroNeural" },
  "portuguese": { languageCode: "pt-BR", voiceName: "pt-BR-AntonioNeural" },
  "korean": { languageCode: "ko-KR", voiceName: "ko-KR-InJoonNeural" },
  "french": { languageCode: "fr-FR", voiceName: "fr-FR-HenriNeural" },
  "japanese": { languageCode: "ja-JP", voiceName: "ja-JP-KeitaNeural" },
  "mandarin": { languageCode: "zh-CN", voiceName: "zh-CN-YunxiNeural" }, 
  "hindi": { languageCode: "hi-IN", voiceName: "hi-IN-MadhurNeural" },
  "indonesian": { languageCode: "id-ID", voiceName: "id-ID-ArdiNeural" },
  "farsi": { languageCode: "fa-IR", voiceName: "fa-IR-FaridNeural" },
  "russian": { languageCode: "ru-RU", voiceName: "ru-RU-DmitryNeural" },
  "arabic": { languageCode: "ar-SA", voiceName: "ar-SA-HamedNeural" },
  "vietnamese": { languageCode: "vi-VN", voiceName: "vi-VN-NamMinhNeural" },
  "ukrainian": { languageCode: "uk-UA", voiceName: "uk-UA-OstapNeural" },
  "urdu": { languageCode: "ur-PK", voiceName: "ur-PK-AsadNeural" },
  "pashto": { languageCode: "ps-AF", voiceName: "ps-AF-GulNawazNeural" }
};

// Polly voice mapping
export const pollyVoiceMap: Record<string, string> = {
  "english": "Joanna",
  "spanish": "Lupe",
  "portuguese": "Camila",
  "french": "Léa",
  "japanese": "Takumi",
  "korean": "Seoyeon",
  "mandarin": "Zhiyu",
  "hindi": "Kajal",
  "indonesian": "Danendra", // Fictional - may need to use another language if this doesn't exist
  "farsi": "Lupe", // Use Spanish voice as fallback (might not be ideal)
  "russian": "Tatyana",
  "arabic": "Hala",
  "vietnamese": "Hiếu", // Fictional - may need to use another language if this doesn't exist
  "ukrainian": "Tatyana", // Use Russian voice as fallback
  "urdu": "Kajal", // Use Hindi voice as fallback
  "pashto": "Kajal" // Use Hindi voice as fallback
};

// Constants
export const MAX_CHUNK_SIZE = 9500;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 500;

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
