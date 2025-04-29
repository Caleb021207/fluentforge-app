
import { supabase } from "@/integrations/supabase/client";
import { ttsCache } from "./cache";
import { useBrowserTTS } from "./browserTTS";
import { trackTTSUsage } from "./tracking";
import type { TTSOptions } from "./types";

/**
 * Plays text using the Supabase Edge Function for TTS.
 * Uses AWS Polly for target language and Azure for native language.
 * Includes caching to reduce API calls and improve performance.
 */
export const playTTS = async (options: TTSOptions): Promise<void> => {
  const { text, language, isTargetLanguage = false, onStart, onEnd, onError } = options;
  
  if (!text || text.trim() === "") {
    onError?.(new Error("Empty text provided"));
    return;
  }
  
  onStart?.();
  
  try {
    console.log(`TTS request for language: ${language}, text length: ${text.length}, isTargetLanguage: ${isTargetLanguage}`);
    
    // Check if we have a cached version
    const cacheKey = ttsCache.createKey(text, language, isTargetLanguage);
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
          isTargetLanguage
        },
      });
      
      if (error) {
        console.error("Edge function error:", error.message);
        // Try using browser TTS as fallback
        console.log("Attempting to use browser TTS as fallback");
        await useBrowserTTS(text, language, onEnd, onError);
        await trackTTSUsage();
        return;
      }
      
      if (!data || !data.audioContent) {
        throw new Error("No audio content received");
      }
      
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
    
    // As a last resort, try the browser's native TTS
    try {
      console.log("Attempting browser's native TTS as last resort");
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
 * Useful for preloading common phrases
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
    
    console.log(`Preloading TTS for language: ${language}, text: ${text.substring(0, 30)}..., isTargetLanguage: ${isTargetLanguage}`);
    
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { 
        text,
        language,
        isTargetLanguage
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
