
import { supabase } from "@/integrations/supabase/client";

// Define the language code mapping for AWS Polly
const LANGUAGE_CODES: Record<string, string> = {
  english: 'en-US',
  spanish: 'es-ES',
  french: 'fr-FR',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  arabic: 'arb',
  hindi: 'hi-IN',
  vietnamese: 'vi-VN',
  indonesian: 'id-ID',
  russian: 'ru-RU',
  mandarin: 'cmn-CN',
  ukrainian: 'uk-UA',
};

// Default voice selections for each language
const DEFAULT_VOICES: Record<string, string> = {
  english: 'Joanna',
  spanish: 'Lupe',
  french: 'Celine',
  japanese: 'Mizuki',
  korean: 'Seoyeon',
  arabic: 'Zeina',
  hindi: 'Aditi',
  vietnamese: 'Hiếu',
  indonesian: 'Danendra',
  russian: 'Tatyana',
  mandarin: 'Zhiyu',
  ukrainian: 'Sofiya',
};

/**
 * Gets the language code for AWS Polly based on the language name
 * @param language Language name (e.g., english, spanish)
 * @returns Language code for AWS Polly
 */
export const getLanguageCode = (language: string): string => {
  return LANGUAGE_CODES[language.toLowerCase()] || 'en-US';
};

/**
 * Gets the default voice for a language
 * @param language Language name (e.g., english, spanish)
 * @returns Default voice ID for the language
 */
export const getDefaultVoice = (language: string): string => {
  return DEFAULT_VOICES[language.toLowerCase()] || 'Joanna';
};

/**
 * Converts text to speech using AWS Polly via Supabase Edge Function
 * @param text Text to convert to speech
 * @param voiceId AWS Polly voice ID
 * @param languageCode AWS Polly language code
 * @returns Audio data as base64 string
 */
export const textToSpeech = async (text: string, voiceId?: string, languageCode?: string): Promise<string> => {
  try {
    // Call the Supabase Edge Function for AWS Polly TTS
    const { data, error } = await supabase.functions.invoke('polly-tts', {
      body: { 
        text,
        voiceId: voiceId || 'Joanna',
        languageCode: languageCode || 'en-US'
      }
    });

    if (error) {
      console.error('Error converting text to speech:', error);
      throw new Error('Failed to convert text to speech');
    }

    if (!data || !data.audioContent) {
      throw new Error('No audio data received');
    }

    return data.audioContent;
  } catch (error) {
    console.error('Error in TTS process:', error);
    throw error;
  }
};

/**
 * Plays audio from base64 data
 * @param audioContent Base64 encoded audio data
 * @returns Promise that resolves when audio playback starts
 */
export const playAudio = async (audioContent: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Convert base64 to binary
      const binary = atob(audioContent);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      // Create blob and audio object
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.oncanplaythrough = () => {
        audio.play();
        resolve();
      };
      
      audio.onerror = (e) => {
        reject(new Error('Error playing audio'));
      };
      
      // Clean up object URL after playback
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Speaks text using AWS Polly
 * @param text Text to speak
 * @param language Language name (e.g., english, spanish) 
 * @param voiceId Optional voice ID override
 * @returns Promise that resolves when audio playback starts
 */
export const speakText = async (text: string, language: string, voiceId?: string): Promise<void> => {
  try {
    const langCode = getLanguageCode(language);
    const voice = voiceId || getDefaultVoice(language);
    const audioContent = await textToSpeech(text, voice, langCode);
    return playAudio(audioContent);
  } catch (error) {
    console.error('Error speaking text:', error);
    throw error;
  }
};
