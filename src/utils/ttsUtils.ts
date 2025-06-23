
import { supabase } from "@/integrations/supabase/client";
import { ttsCache } from "./tts/cache";

export interface TTSOptions {
  text: string;
  language: string;
  useMetaMms?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Plays text-to-speech using the best available TTS provider
 */
export async function playTTS(options: TTSOptions): Promise<boolean> {
  const { text, language, useMetaMms = false, onStart, onEnd, onError } = options;
  
  if (!text || text.trim() === "") {
    console.warn("Empty text provided to playTTS");
    onError?.(new Error("Empty text provided"));
    return false;
  }

  try {
    // Check if we have this audio in cache
    const cachedAudio = ttsCache.get(text, language);
    if (cachedAudio) {
      console.log("Using cached TTS audio");
      const audio = createAudioFromBase64(cachedAudio);
      playAudio(audio, onStart, onEnd);
      return true;
    }
    
    // Get the user interface language from localStorage or context
    const userInterfaceLanguage = localStorage.getItem('selectedLanguage') || 'english';
    
    // Call the Supabase Edge Function for TTS
    console.log(`Generating TTS for "${text.substring(0, 30)}..." in ${language}`);
    onStart?.();
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text, 
        language, 
        useMetaMms,
        userInterfaceLanguage // Pass the interface language for TTS logic
      }
    });
    
    if (error) {
      throw new Error(`TTS API error: ${error.message}`);
    }
    
    if (!data || !data.audioContent) {
      throw new Error("No audio data received from TTS API");
    }
    
    // Cache the audio content (base64 string) for future use
    ttsCache.set(text, language, data.audioContent);
    
    // Convert base64 to audio and play
    const audio = createAudioFromBase64(data.audioContent);
    
    // Play the audio
    playAudio(audio, undefined, onEnd);
    return true;
    
  } catch (error) {
    console.error("TTS error:", error);
    onError?.(error as Error);
    return false;
  }
}

/**
 * Preloads TTS audio without playing it
 */
export async function preloadTTS(options: TTSOptions): Promise<boolean> {
  const { text, language, useMetaMms = false } = options;
  
  if (!text || text.trim() === "") {
    return false;
  }
  
  try {
    // Check if already cached
    if (ttsCache.has(text, language)) {
      return true;
    }
    
    // Get the user interface language from localStorage or context
    const userInterfaceLanguage = localStorage.getItem('selectedLanguage') || 'english';
    
    console.log(`Preloading TTS for "${text.substring(0, 30)}..." in ${language}`);
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text, 
        language, 
        useMetaMms,
        userInterfaceLanguage // Pass the interface language for TTS logic
      }
    });
    
    if (error || !data || !data.audioContent) {
      return false;
    }
    
    // Store the base64 string directly in the cache
    ttsCache.set(text, language, data.audioContent);
    return true;
  } catch (error) {
    console.error("Preload TTS error:", error);
    return false;
  }
}

/**
 * Utility function to play an Audio object
 */
function playAudio(audio: HTMLAudioElement, onStart?: () => void, onEnd?: () => void) {
  audio.onplay = () => onStart?.();
  audio.onended = () => onEnd?.();
  audio.onerror = () => {
    console.error("Audio playback error");
    onEnd?.();
  };
  
  // Sometimes audio doesn't play if it's not loaded yet
  audio.load();
  
  // Start playback
  setTimeout(() => {
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(error => {
        console.error("Error playing audio:", error);
        onEnd?.();
      });
    }
  }, 100);
}

/**
 * Creates an Audio element from base64 data
 */
export function createAudioFromBase64(base64Audio: string): HTMLAudioElement {
  return new Audio(`data:audio/mp3;base64,${base64Audio}`);
}

/**
 * Tracks TTS usage
 */
export function trackTTSUsage(userId: string, language: string): void {
  // Only track if user is logged in
  if (!userId) return;
  
  try {
    // Use the correct table structure for api_calls_tracking
    supabase
      .from('api_calls_tracking')
      .insert([
        { 
          user_id: userId,
          service: 'tts',
          endpoint: 'usage'
        }
      ])
      .then(({ error }) => {
        if (error) {
          console.error("Error tracking TTS usage:", error);
        }
      });
  } catch (error) {
    console.error("Failed to track TTS usage:", error);
  }
}

// Re-export the cache implementation for consistency
export { ttsCache } from "./tts/cache";
