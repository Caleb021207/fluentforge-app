
import { supabase } from "@/integrations/supabase/client";
import { ttsCache } from "./cache";
import { useBrowserTTS } from "./browserTTS";
import { trackTTSUsage } from "./tracking";
import type { TTSOptions } from "./types";

/**
 * Plays text using the Supabase Edge Function for TTS.
 * Optimized for performance with efficient caching.
 */
export const playTTS = async (options: TTSOptions): Promise<void> => {
  const { text, language, isTargetLanguage = false, onStart, onEnd, onError } = options;
  
  if (!text || text.trim() === "") {
    onError?.(new Error("Empty text provided"));
    return;
  }
  
  onStart?.();
  
  try {
    // Check if we have a cached version first
    const cacheKey = ttsCache.createKey(text, language, isTargetLanguage);
    const cachedAudio = ttsCache.get(cacheKey);
    
    let audioContent;
    let isFromCache = false;
    
    if (cachedAudio) {
      console.log("Using cached audio response");
      audioContent = cachedAudio;
      isFromCache = true;
    } else {
      // Call the optimized Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text, language, isTargetLanguage },
      });
      
      if (error) {
        console.error("Edge function error:", error.message);
        // Immediately try browser TTS as fallback
        await useBrowserTTS(text, language, onEnd, onError);
        await trackTTSUsage();
        return;
      }
      
      if (!data || !data.audioContent) {
        throw new Error("No audio content received");
      }
      
      audioContent = data.audioContent;
      ttsCache.set(cacheKey, audioContent);
    }
    
    // Create and play audio more efficiently
    const binaryString = atob(audioContent);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    // Process in larger chunks for better performance
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const end = Math.min(i + chunkSize, len);
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
    
    await audio.play();
    
    // Track TTS usage
    if (!isFromCache) {
      await trackTTSUsage();
    }
    
  } catch (err) {
    console.error("Error with TTS:", err);
    
    // Try browser's native TTS as fallback
    try {
      await useBrowserTTS(text, language, onEnd, onError);
      await trackTTSUsage();
    } catch (browserErr) {
      console.error("Browser TTS also failed:", browserErr);
      onEnd?.();
      onError?.(new Error(`TTS failed: ${err.message}`));
    }
  }
};

/**
 * Preloads TTS audio for future usage
 * Optimized for background loading
 */
export const preloadTTS = async (
  text: string, 
  language: string, 
  isTargetLanguage: boolean = false
): Promise<void> => {
  if (!text || text.trim() === "") return;
  
  try {
    const cacheKey = ttsCache.createKey(text, language, isTargetLanguage);
    
    // If already cached, don't preload again
    if (ttsCache.get(cacheKey)) return;
    
    // Use low priority fetch for preloading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for preloads
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { text, language, isTargetLanguage },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (error || !data || !data.audioContent) {
      console.error("Failed to preload TTS:", error || "No audio content");
      return;
    }
    
    // Cache the result
    ttsCache.set(cacheKey, data.audioContent);
    
    // Track voice practice usage for preloading
    await trackTTSUsage();
    
  } catch (err) {
    // Silently fail for preloads - they're not critical
    console.error("Error preloading TTS:", err);
  }
};
