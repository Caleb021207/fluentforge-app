
import { supabase } from "@/integrations/supabase/client";
import { getSpeechSynthesisLanguageCode, findBestVoiceForLanguage } from "@/utils/languageUtils";

export interface TTSOptions {
  text: string;
  language: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Plays text using the Supabase Edge Function for TTS.
 * Falls back to browser's speech synthesis if the edge function fails.
 */
export const playTTS = async (options: TTSOptions): Promise<void> => {
  const { text, language, onStart, onEnd, onError } = options;
  
  if (!text || text.trim() === "") {
    onError?.(new Error("Empty text provided"));
    return;
  }
  
  onStart?.();
  
  try {
    // First try the Supabase Edge Function for higher quality TTS
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text,
        language,
      },
    });
    
    if (error) throw new Error(`Edge function error: ${error.message}`);
    if (!data || !data.audioContent) throw new Error("No audio content received");
    
    // Convert base64 to binary
    const audioContent = data.audioContent;
    const binaryString = atob(audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and play
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      onEnd?.();
      URL.revokeObjectURL(url);
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      onEnd?.();
      URL.revokeObjectURL(url);
      throw new Error("Audio playback failed");
    };
    
    await audio.play();
    
  } catch (err) {
    console.error("Error with edge function TTS:", err);
    
    // Fall back to browser's speech synthesis
    try {
      console.log(`Falling back to browser speech synthesis for language: ${language}`);
      const speechSynthesis = window.speechSynthesis;
      
      if (!speechSynthesis) {
        throw new Error("Speech synthesis not supported in this browser");
      }
      
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get the correct language code for speech synthesis
      const langCode = getSpeechSynthesisLanguageCode(language);
      utterance.lang = langCode;
      
      // Find best voice for this language
      const voice = findBestVoiceForLanguage(speechSynthesis, langCode);
      if (voice) {
        console.log(`Using voice: ${voice.name} (${voice.lang})`);
        utterance.voice = voice;
      } else {
        console.warn(`No matching voice found for language: ${langCode}`);
      }
      
      utterance.onend = () => onEnd?.();
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        onEnd?.();
        onError?.(new Error("Browser speech synthesis failed"));
      };
      
      speechSynthesis.speak(utterance);
    } catch (fallbackError) {
      console.error("Fallback speech synthesis error:", fallbackError);
      onEnd?.();
      onError?.(new Error(`TTS failed: ${fallbackError.message}`));
    }
  }
};

/**
 * Checks if the browser supports TTS capabilities
 */
export const isTTSSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * Get available voices from the browser's speech synthesis
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isTTSSupported()) return [];
  return window.speechSynthesis.getVoices();
};
