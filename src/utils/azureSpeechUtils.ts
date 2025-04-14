
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Use an environment variable approach that works in the browser
const speechConfig = sdk.SpeechConfig.fromSubscription(
  import.meta.env.VITE_AZURE_SPEECH_KEY || '',
  'eastus' // default region, can be configured per deployment
);

export const initAzureSpeechToText = (language: string) => {
  speechConfig.speechRecognitionLanguage = mapLanguageToAzureCode(language);
  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  return {
    startRecognition: () => {
      return new Promise((resolve) => {
        recognizer.recognized = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(e.result.text);
          }
        };
        recognizer.startContinuousRecognitionAsync();
      });
    },
    stopRecognition: () => {
      return recognizer.stopContinuousRecognitionAsync();
    },
    isRecognizing: false,
  };
};

export const azureTextToSpeech = async (text: string, language: string): Promise<ArrayBuffer> => {
  speechConfig.speechSynthesisLanguage = mapLanguageToAzureCode(language);
  speechConfig.speechSynthesisVoiceName = getAzureVoiceForLanguage(language);
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.audioData) {
          resolve(result.audioData);
        } else {
          reject(new Error('No audio data received'));
        }
        synthesizer.close();
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

export const getAzureVoiceForLanguage = (language: string): string => {
  // Updated voice mapping to use Azure's neural voices
  const voiceMap: Record<string, string> = {
    'english': 'en-US-JennyNeural',
    'spanish': 'es-ES-ElviraNeural',
    'french': 'fr-FR-DeniseNeural',
    'german': 'de-DE-KatjaNeural',
    'italian': 'it-IT-ElsaNeural',
    'portuguese': 'pt-BR-FranciscaNeural',
    'russian': 'ru-RU-SvetlanaNeural',
    'japanese': 'ja-JP-NanamiNeural',
    'korean': 'ko-KR-SunHiNeural',
    'chinese': 'zh-CN-XiaoxiaoNeural',
    'hindi': 'hi-IN-SwaraNeural',
    'arabic': 'ar-SA-ZariyahNeural',
    'vietnamese': 'vi-VN-HoaiMyNeural',
    'indonesian': 'id-ID-GadisNeural',
    'thai': 'th-TH-PremwadeeNeural',
    'turkish': 'tr-TR-EmelNeural',
    'polish': 'pl-PL-AgnieszkaNeural',
    'dutch': 'nl-NL-ColetteNeural',
    'czech': 'cs-CZ-VlastaNeural',
    'greek': 'el-GR-AthinaNeural',
    'swedish': 'sv-SE-SofieNeural',
    'danish': 'da-DK-ChristelNeural',
    'finnish': 'fi-FI-SelmaNeural',
    'norwegian': 'nb-NO-IselinNeural',
    'hungarian': 'hu-HU-NoemiNeural',
    'romanian': 'ro-RO-AlinaNeural',
    'bulgarian': 'bg-BG-KalinaNeural',
    'ukrainian': 'uk-UA-PolinaNeural',
    'slovak': 'sk-SK-ViktoriaNeural',
    'croatian': 'hr-HR-GabrijelaNeural',
    'lithuanian': 'lt-LT-OnaNeural',
    'slovenian': 'sl-SI-PetraNeural',
    'estonian': 'et-EE-AnuNeural',
    'latvian': 'lv-LV-EveritaNeural',
    'persian': 'fa-IR-DilaraNeural',
    'filipino': 'fil-PH-BlessicaNeural',
    'bengali': 'bn-IN-TanishaaNeural',
    'tamil': 'ta-IN-PallaviNeural',
    'urdu': 'ur-PK-UzmaNeural',
    'telugu': 'te-IN-ShrutiNeural',
    'marathi': 'mr-IN-AarohiNeural',
    'gujarati': 'gu-IN-DhwaniNeural',
    'kannada': 'kn-IN-SapnaNeural',
    'malayalam': 'ml-IN-SobhanaNeural'
  };

  return voiceMap[language] || 'en-US-JennyNeural';
};

const mapLanguageToAzureCode = (language: string): string => {
  const languageMap: Record<string, string> = {
    'english': 'en-US',
    'spanish': 'es-ES',
    'french': 'fr-FR',
    'german': 'de-DE',
    'italian': 'it-IT',
    'portuguese': 'pt-BR',
    'russian': 'ru-RU',
    'japanese': 'ja-JP',
    'korean': 'ko-KR',
    'chinese': 'zh-CN',
    'hindi': 'hi-IN',
    'arabic': 'ar-SA',
    'vietnamese': 'vi-VN',
    'indonesian': 'id-ID',
    'thai': 'th-TH',
    'turkish': 'tr-TR',
    'polish': 'pl-PL',
    'dutch': 'nl-NL',
    'czech': 'cs-CZ',
    'greek': 'el-GR',
    'swedish': 'sv-SE',
    'danish': 'da-DK',
    'finnish': 'fi-FI',
    'norwegian': 'nb-NO',
    'hungarian': 'hu-HU',
    'romanian': 'ro-RO',
    'bulgarian': 'bg-BG',
    'ukrainian': 'uk-UA',
    'slovak': 'sk-SK',
    'croatian': 'hr-HR',
    'lithuanian': 'lt-LT',
    'slovenian': 'sl-SI',
    'estonian': 'et-EE',
    'latvian': 'lv-LV',
    'persian': 'fa-IR',
    'filipino': 'fil-PH',
    'bengali': 'bn-IN',
    'tamil': 'ta-IN',
    'urdu': 'ur-PK',
    'telugu': 'te-IN',
    'marathi': 'mr-IN',
    'gujarati': 'gu-IN',
    'kannada': 'kn-IN',
    'malayalam': 'ml-IN'
  };

  return languageMap[language] || 'en-US';
};
