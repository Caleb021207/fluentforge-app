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

// Track TTS usage in the database - now tracking all uses as "voice_practice"
const trackTTSUsage = async () => {
  try {
    console.log("Starting voice practice tracking...");
    
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user for tracking:", userError);
      return;
    }
    
    const user = userResponse.user;
    if (!user) {
      console.log("No user found for tracking");
      return;
    }

    console.log(`Tracking voice practice for user ${user.id}`);
    
    // Log the API call to the tracking table with voice_practice as the call type
    const { data, error } = await supabase.from('api_calls_tracking').insert({
      user_id: user.id,
      call_type: 'voice_practice'
    });
    
    if (error) {
      console.error("Error inserting tracking record:", error);
      return;
    }
    
    console.log("Voice practice usage tracked successfully");
    
    // Force recalculation of metrics
    try {
      const { error: recalcError } = await supabase.rpc('recalculate_student_metrics', {
        target_student_id: user.id
      });
      
      if (recalcError) {
        console.error("Error recalculating metrics:", recalcError);
      } else {
        console.log("Student metrics recalculated successfully");
      }
    } catch (recalcErr) {
      console.error("Exception in recalculating metrics:", recalcErr);
    }
    
  } catch (error) {
    console.error("Error tracking TTS usage:", error);
  }
};

/**
 * Uses browser's built-in TTS for Farsi language
 */
const useBrowserTTS = (text: string, onEnd?: () => void, onError?: (error: Error) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.speechSynthesis) {
        const error = new Error("Browser speech synthesis not available");
        onError?.(error);
        reject(error);
        return;
      }

      console.log("Using browser's built-in TTS for Farsi text");
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR'; // Set language to Farsi
      
      utterance.onend = () => {
        onEnd?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error("Browser TTS error:", event);
        const error = new Error(`Browser TTS error: ${event.error}`);
        onError?.(error);
        reject(error);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Error with browser TTS:", err);
      onError?.(new Error(`Browser TTS failed: ${err.message}`));
      reject(err);
    }
  });
};

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
    
    // For Farsi language, use browser's built-in TTS directly
    if (language.toLowerCase() === "farsi") {
      await useBrowserTTS(text, onEnd, onError);
      await trackTTSUsage();
      return;
    }
    
    // Create a cache key based on text and language
    const cacheKey = `${Date.now()}_${language}_${text.substring(0, 50)}`;
    
    // Check if we have a cached version
    const cachedAudio = ttsCache.get(cacheKey);
    
    let audioContent;
    let isFromCache = false;
    
    if (cachedAudio) {
      console.log("Using cached audio response");
      audioContent = cachedAudio;
      isFromCache = true;
    } else {
      // Call the Supabase Edge Function for TTS
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { 
          text,
          language,
        },
      });
      
      if (error) throw new Error(`Edge function error: ${error.message}`);
      
      // Handle the special case for Farsi from the edge function
      if (data && data.useBrowserTTS) {
        console.log("Edge function indicated to use browser TTS");
        await useBrowserTTS(text, onEnd, onError);
        await trackTTSUsage();
        return;
      }
      
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
    
    // Track ALL TTS usage in the database, whether from cache or not
    await trackTTSUsage();
    
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
  
  // Don't preload for Farsi as we'll use browser TTS
  if (language.toLowerCase() === "farsi") return;
  
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
    
    // Track voice practice usage for preloading as well
    await trackTTSUsage();
    
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
