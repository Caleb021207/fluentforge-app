
import { supabase } from "@/integrations/supabase/client";
import { ttsCache } from "./cache";
import { useBrowserTTS } from "./browserTTS";
import type { TTSOptions } from "./types";
import { toast } from "sonner";

/**
 * Retry helper with exponential backoff for throttled requests
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a throttling error
      const isThrottled = error?.message?.includes("Throttled") || 
                         error?.message?.includes("throttled") ||
                         error?.message?.includes("429") ||
                         error?.message?.includes("500");
      
      if (isThrottled && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`TTS throttled, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

/**
 * Play audio using Supabase Edge Function TTS (OpenAI)
 */
export const playTTS = async ({
  text,
  language,
  speechRate = 1.0,
  voice = 'alloy',
  onStart,
  onEnd,
  onError
}: TTSOptions): Promise<HTMLAudioElement | null> => {
  if (!text || text.trim() === "") {
    console.warn("Empty text provided to playTTS");
    onError?.("Empty text provided");
    return null;
  }

  // Check for existing cached audio for this text with this speech rate
  const cachedAudio = ttsCache.get(text, language, speechRate);

  if (cachedAudio) {
    console.log("Using cached audio for text:", text.substring(0, 40) + "... at rate:", speechRate);
    return playAudioFromBase64(cachedAudio, onStart, onEnd, onError);
  }

  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call the Supabase Edge Function with retry logic for throttling
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.functions.invoke("text-to-speech", {
        body: {
          text,
          language,
          voice,
          speechRate,
          userId: user?.id
        },
      });
    });

    // Check if we should use browser fallback due to limit
    if (data?.useFallback) {
      console.log("TTS token limit reached, using browser fallback");
      
      // Show toast notification to user
      toast.info("Switched to Cloud TTS", {
        description: "You've reached your monthly Azure TTS token limit. Now using browser text-to-speech."
      });
      
      // Use browser TTS as fallback
      const browserTTS = useBrowserTTS();
      if (browserTTS.isBrowserSupported) {
        console.log("Falling back to browser TTS");
        browserTTS.speak(text, language, onStart, onEnd, onError);
        return null;
      }
      
      onError?.("TTS limit reached and browser TTS not available");
      return null;
    }

    if (error || !data?.audioContent) {
      console.error("TTS error from Supabase:", error || "No audio content returned");
      
      // Fall back to browser TTS if available
      const browserTTS = useBrowserTTS();
      if (browserTTS.isBrowserSupported) {
        console.log("Falling back to browser TTS");
        browserTTS.speak(text, language, onStart, onEnd, onError);
        return null;
      }
      
      onError?.(error?.message || "Failed to generate speech");
      return null;
    }

    // Cache the audio for future requests with speech rate
    ttsCache.set(text, language, data.audioContent, speechRate);

    // Play the audio (tracking is done in the edge function)
    return playAudioFromBase64(data.audioContent, onStart, onEnd, onError);
  } catch (err: any) {
    console.error("TTS error:", err);
    onError?.(err?.message || "Failed to generate speech");
    return null;
  }
};

/**
 * Preload TTS audio for future use
 */
export const preloadTTS = async (text: string, language: string, speechRate = 1.0, voice = 'alloy') => {
  if (!text || text.trim() === "") return;

  if (ttsCache.has(text, language, speechRate)) {
    console.log("Audio already preloaded for text:", text.substring(0, 40) + "... at rate:", speechRate);
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.functions.invoke("text-to-speech", {
        body: {
          text,
          language,
          voice,
          speechRate,
          userId: user?.id
        },
      });
    });

    if (error || !data?.audioContent) {
      console.error("Preload TTS error from Supabase:", error || "No audio content returned");
      return;
    }

    // Cache the audio with speech rate
    ttsCache.set(text, language, data.audioContent, speechRate);
    console.log("Successfully preloaded audio for text:", text.substring(0, 40) + "...");
  } catch (err) {
    console.error("Preload TTS error:", err);
  }
};

/**
 * Helper to play base64 audio
 */
const playAudioFromBase64 = (base64Audio: string, onStart?: () => void, onEnd?: () => void, onError?: (error: string) => void) => {
  try {
    // Create an audio context and source
    const audio = new Audio("data:audio/mp3;base64," + base64Audio);

    // Set up event listeners
    audio.addEventListener("play", () => {
      onStart?.();
    });

    audio.addEventListener("ended", () => {
      onEnd?.();
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      onError?.("Audio playback error");
    });

    // Play the audio
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.error("Error playing audio:", error);
        onError?.("Error playing audio: " + error.message);
      });
    }

    return audio;
  } catch (err: any) {
    console.error("Error creating audio element:", err);
    onError?.("Error creating audio element: " + err.message);
    return null;
  }
};
