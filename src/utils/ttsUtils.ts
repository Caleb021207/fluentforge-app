
import { supabase } from "@/integrations/supabase/client";
import { createTTSCache } from "./tts/cache";

export interface TTSOptions {
  text: string;
  language: string;
  isTargetLanguage?: boolean;
  useMetaMms?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

const ttsCache = createTTSCache();

/**
 * Plays text-to-speech using the best available TTS provider
 */
export async function playTTS(options: TTSOptions): Promise<boolean> {
  const { text, language, isTargetLanguage = true, useMetaMms = false, onStart, onEnd, onError } = options;
  
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
      playAudio(cachedAudio, onStart, onEnd);
      return true;
    }
    
    // Call the Supabase Edge Function for TTS
    console.log(`Generating TTS for "${text.substring(0, 30)}..." in ${language}`);
    onStart?.();
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text, 
        language, 
        isTargetLanguage,
        useMetaMms
      }
    });
    
    if (error) {
      throw new Error(`TTS API error: ${error.message}`);
    }
    
    if (!data || !data.audioContent) {
      throw new Error("No audio data received from TTS API");
    }
    
    // Convert base64 to audio and play
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    
    // Cache the audio for future use
    ttsCache.set(text, language, audio);
    
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
  const { text, language, isTargetLanguage = true, useMetaMms = false } = options;
  
  if (!text || text.trim() === "") {
    return false;
  }
  
  try {
    // Check if already cached
    if (ttsCache.get(text, language)) {
      return true;
    }
    
    console.log(`Preloading TTS for "${text.substring(0, 30)}..." in ${language}`);
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text, 
        language, 
        isTargetLanguage,
        useMetaMms
      }
    });
    
    if (error || !data || !data.audioContent) {
      return false;
    }
    
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    ttsCache.set(text, language, audio);
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
    // Instead of trying to use a potentially non-existent table,
    // log the usage to the api_calls_tracking table which does exist
    supabase
      .from('api_calls_tracking')
      .insert([
        { 
          user_id: userId,
          call_type: 'tts_usage',
          metadata: { language }
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
export { createTTSCache };
