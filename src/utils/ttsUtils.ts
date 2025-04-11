
import { supabase } from "@/integrations/supabase/client";
import { DataCache } from "@/utils/cacheUtils";

export interface TTSOptions {
  text: string;
  language: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// Create a dedicated audio cache for TTS
const ttsCache = new Map<string, string>();
const TTL_DURATION = 30 * 60 * 1000; // 30 minutes

// Cleanup expired cache entries periodically
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of Object.entries(ttsCache)) {
    const timestamp = parseInt(key.split('_')[0]);
    if (now - timestamp > TTL_DURATION) {
      ttsCache.delete(key);
    }
  }
};

// Run cache cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 10 * 60 * 1000);
}

/**
 * Plays text using the Supabase Edge Function for OpenAI TTS.
 * Includes caching to reduce API calls and improve performance.
 */
export const playTTS = async (options: TTSOptions): Promise<void> => {
  const { text, language, onStart, onEnd, onError } = options;
  
  if (!text || text.trim() === "") {
    onError?.(new Error("Empty text provided"));
    return;
  }
  
  onStart?.();
  
  try {
    console.log(`TTS request for language: ${language}, text length: ${text.length}`);
    
    // Create a cache key based on text and language
    const cacheKey = `${Date.now()}_${language}_${text.substring(0, 50)}`;
    
    // Check if we have a cached version
    const cachedAudio = ttsCache.get(cacheKey);
    
    let audioContent;
    if (cachedAudio) {
      console.log("Using cached audio response");
      audioContent = cachedAudio;
    } else {
      // Call the Supabase Edge Function for TTS
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { 
          text,
          language,
        },
      });
      
      if (error) throw new Error(`Edge function error: ${error.message}`);
      if (!data || !data.audioContent) throw new Error("No audio content received");
      
      audioContent = data.audioContent;
      
      // Cache the result for future use
      ttsCache.set(cacheKey, audioContent);
    }
    
    // Convert base64 to binary more efficiently
    const binaryString = atob(audioContent);
    const bytes = new Uint8Array(binaryString.length);
    
    // Process in chunks to prevent memory issues
    const chunkSize = 2048;
    for (let i = 0; i < binaryString.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, binaryString.length);
      for (let j = i; j < end; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
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
      onError?.(new Error("Audio playback failed"));
    };
    
    console.log("Playing audio...");
    await audio.play();
    
  } catch (err) {
    console.error("Error with TTS:", err);
    onEnd?.();
    onError?.(new Error(`TTS failed: ${err.message}`));
  }
};

/**
 * Preloads TTS audio for future usage
 * Useful for preloading common phrases
 */
export const preloadTTS = async (text: string, language: string): Promise<void> => {
  if (!text || text.trim() === "") return;
  
  try {
    const cacheKey = `${Date.now()}_${language}_${text.substring(0, 50)}`;
    
    // If already cached, don't preload again
    if (ttsCache.has(cacheKey)) return;
    
    console.log(`Preloading TTS for language: ${language}, text: ${text.substring(0, 30)}...`);
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text,
        language,
      },
    });
    
    if (error || !data || !data.audioContent) {
      console.error("Failed to preload TTS:", error || "No audio content");
      return;
    }
    
    // Cache the result
    ttsCache.set(cacheKey, data.audioContent);
    console.log("TTS preloaded successfully");
    
  } catch (err) {
    console.error("Error preloading TTS:", err);
  }
};

/**
 * Basic browser TTS detection - just for feature detection, not for actual use
 */
export const isTTSSupported = (): boolean => {
  return typeof window !== 'undefined';
};
