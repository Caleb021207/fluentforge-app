
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
  "cantonese": { languageCode: "zh-HK", voiceName: "zh-HK-WanLungNeural" }, 
  "hindi": { languageCode: "hi-IN", voiceName: "hi-IN-MadhurNeural" },
  "indonesian": { languageCode: "id-ID", voiceName: "id-ID-ArdiNeural" },
  "farsi": { languageCode: "fa-IR", voiceName: "fa-IR-FaridNeural" },
  "russian": { languageCode: "ru-RU", voiceName: "ru-RU-DmitryNeural" },
  "arabic": { languageCode: "ar-SA", voiceName: "ar-SA-HamedNeural" },
  "vietnamese": { languageCode: "vi-VN", voiceName: "vi-VN-NamMinhNeural" },
  "ukrainian": { languageCode: "uk-UA", voiceName: "uk-UA-OstapNeural" },
  "urdu": { languageCode: "ur-PK", voiceName: "ur-PK-AsadNeural" },
  "pashto": { languageCode: "ps-AF", voiceName: "ps-AF-GulNawazNeural" },
  "swahili": { languageCode: "sw-KE", voiceName: "sw-KE-RafikiNeural" },
  "german": { languageCode: "de-DE", voiceName: "de-DE-KatjaNeural" },
  "italian": { languageCode: "it-IT", voiceName: "it-IT-DiegoNeural" },
  // Add Thai language support with Azure voice
  "thai": { languageCode: "th-TH", voiceName: "th-TH-PremwadeeNeural" },
  // Add Burmese language support with Azure voice
  "burmese": { languageCode: "my-MM", voiceName: "my-MM-NilarNeural" },
  // Add Karen language support with Azure voice (using Myanmar as base)
  "karen": { languageCode: "my-MM", voiceName: "my-MM-ThihaNeural" },
  // Add Nepali language support with Azure voice
  "nepali": { languageCode: "ne-NP", voiceName: "ne-NP-HemkalaNeural" },
  // Add Tigrinya language support with Azure voice (using Amharic as closest available)
  "tigrinya": { languageCode: "am-ET", voiceName: "am-ET-MekdesNeural" },
  // Add Punjabi language support with Azure voice
  "punjabi": { languageCode: "pa-IN", voiceName: "pa-IN-GurdeepNeural" },
  // Add Marathi language support with Azure voice
  "marathi": { languageCode: "mr-IN", voiceName: "mr-IN-AarohiNeural" },
  // Add Gujarati language support with Azure voice
  "gujarati": { languageCode: "gu-IN", voiceName: "gu-IN-DhwaniNeural" },
  // Add Sinhala language support with Azure voice
  "sinhala": { languageCode: "si-LK", voiceName: "si-LK-SameeraNeural" },
  // Re-adding previously removed languages
  "haitian": { languageCode: "ht-HT", voiceName: "ht-HT-DefaultNeural" },
  "igbo": { languageCode: "ig-NG", voiceName: "ig-NG-DefaultNeural" },
  "bengali": { languageCode: "bn-BD", voiceName: "bn-BD-PradeepNeural" },
  "somali": { languageCode: "so-SO", voiceName: "so-SO-MuuseNeural" },
  "yoruba": { languageCode: "yo-NG", voiceName: "yo-NG-AbeoNeural" },
  "amharic": { languageCode: "am-ET", voiceName: "am-ET-AmehaNeural" },
  "malayalam": { languageCode: "ml-IN", voiceName: "ml-IN-SobhanaNeural" },
  "polish": { languageCode: "pl-PL", voiceName: "pl-PL-MarekNeural" },
  "turkish": { languageCode: "tr-TR", voiceName: "tr-TR-EmelNeural" },
  "romanian": { languageCode: "ro-RO", voiceName: "ro-RO-EmilNeural" },
  "tagalog": { languageCode: "fil-PH", voiceName: "fil-PH-AngeloNeural" }
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
  "cantonese": "Zhiyu", // Use Mandarin voice as fallback for Cantonese
  "hindi": "Kajal",
  "indonesian": "Danendra", // Fictional - may need to use another language if this doesn't exist
  "farsi": "Lupe", // Use Spanish voice as fallback (might not be ideal)
  "russian": "Tatyana",
  "arabic": "Hala",
  "vietnamese": "Hiếu", // Fictional - may need to use another language if this doesn't exist
  "ukrainian": "Tatyana", // Use Russian voice as fallback
  "urdu": "Kajal", // Use Hindi voice as fallback
  "pashto": "Kajal", // Use Hindi voice as fallback
  "swahili": "Joanna", // Use English voice as fallback
  "german": "Marlene",
  "italian": "Bianca",
  // Add Thai voice for Polly (using fallback)
  "thai": "Aditi", // Use closest available voice as fallback
  // Add Burmese voice for Polly (using fallback)
  "burmese": "Aditi", // Use closest available voice as fallback
  // Add Karen voice for Polly (using fallback)
  "karen": "Aditi", // Use closest available voice as fallback
  // Add Nepali voice for Polly (using fallback)
  "nepali": "Aditi", // Use closest available voice as fallback
  // Add Tigrinya voice for Polly (using fallback)
  "tigrinya": "Aditi", // Use closest available voice as fallback
  // Add Punjabi voice for Polly (using fallback)
  "punjabi": "Aditi", // Use closest available voice as fallback
  // Add Marathi voice for Polly (using fallback)
  "marathi": "Aditi", // Use closest available voice as fallback
  // Add Gujarati voice for Polly (using fallback)
  "gujarati": "Aditi", // Use closest available voice as fallback
  // Add Sinhala voice for Polly (using fallback)
  "sinhala": "Aditi", // Use closest available voice as fallback
  // Re-adding previously removed languages
  "haitian": "Joanna", // Use English voice as fallback
  "igbo": "Joanna", // Use English voice as fallback
  "bengali": "Kajal", // Use Hindi voice as fallback
  "somali": "Joanna", // Use English voice as fallback
  "yoruba": "Joanna", // Use English voice as fallback
  "amharic": "Joanna", // Use English voice as fallback
  "malayalam": "Kajal", // Use Hindi voice as fallback
  "polish": "Tatyana", // Use Russian voice as fallback
  "turkish": "Tatyana", // Use Russian voice as fallback
  "romanian": "Tatyana", // Use Russian voice as fallback
  "tagalog": "Joanna" // Use English voice as fallback for Tagalog
};

// Meta MMS language support
export const metaMmsLanguageMap: Record<string, string> = {
  "haitian": "hat", // Haitian Creole ISO 639-3 code
  "igbo": "ibo",    // Igbo ISO 639-3 code
  "yoruba": "yor",  // Yoruba ISO 639-3 code
  "somali": "som",  // Somali ISO 639-3 code
  "bengali": "ben", // Bengali ISO 639-3 code
  "amharic": "amh", // Amharic ISO 639-3 code
  "malayalam": "mal", // Malayalam ISO 639-3 code
  "tagalog": "fil", // Added Tagalog ISO 639-3 code
  "cantonese": "yue", // Added Cantonese ISO 639-3 code
  "german": "deu",    // Added German ISO 639-3 code
  "italian": "ita",   // Added Italian ISO 639-3 code
  "thai": "tha",      // Added Thai ISO 639-3 code
  "burmese": "mya",   // Added Burmese ISO 639-3 code
  "karen": "ksw",     // Added Karen ISO 639-3 code
  "nepali": "nep",    // Added Nepali ISO 639-3 code
  "tigrinya": "tir",  // Added Tigrinya ISO 639-3 code
  "punjabi": "pan",   // Added Punjabi ISO 639-3 code
  "marathi": "mar",   // Added Marathi ISO 639-3 code
  "gujarati": "guj",  // Added Gujarati ISO 639-3 code
  "sinhala": "sin"    // Added Sinhala ISO 639-3 code
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
