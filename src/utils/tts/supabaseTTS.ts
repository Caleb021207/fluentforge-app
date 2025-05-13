
import { supabase } from "@/integrations/supabase/client";
import { ttsCache } from "./cache";
import { useBrowserTTS } from "./browserTTS";
import { trackTTSUsage } from "./tracking";
import { metaMmsLanguageMap } from "./constants";
import type { TTSOptions } from "./types";

/**
 * Play audio using Supabase Edge Function TTS
 */
export const playTTS = async ({
  text,
  language,
  isTargetLanguage = false,
  useMetaMms = false,
  speechRate = 1.0,
  onStart,
  onEnd,
  onError
}: TTSOptions) => {
  if (!text || text.trim() === "") {
    console.warn("Empty text provided to playTTS");
    onError?.("Empty text provided");
    return;
  }

  // For single word playback, we'll use a different cache key that includes the speech rate
  const cacheKey = `${speech_rate_${speechRate}}:${text}`;
  
  // Check for existing cached audio for this text, language, and speech rate
  const cachedAudio = ttsCache.get(cacheKey, language);

  if (cachedAudio) {
    console.log("Using cached audio for", language, text.substring(0, 40) + "...");
    return playAudioFromBase64(cachedAudio, onStart, onEnd, onError);
  }

  try {
    // Pass the Meta MMS flag but don't prioritize it
    // The Edge Function will always try Azure first
    const usesMetaMms = useMetaMms || !!metaMmsLanguageMap[language?.toLowerCase()];
    
    if (usesMetaMms) {
      console.log(`Meta MMS available as fallback for ${language} text-to-speech`);
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: {
        text,
        language,
        isTargetLanguage,
        useMetaMms: usesMetaMms,
        speechRate: speechRate
      },
    });

    if (error || !data?.audioContent) {
      console.error("TTS error from Supabase:", error || "No audio content returned");
      
      // Fall back to browser TTS if available
      const browserTTS = useBrowserTTS();
      if (browserTTS.isBrowserSupported) {
        console.log("Falling back to browser TTS");
        return browserTTS.speak(text, language, onStart, onEnd, onError);
      }
      
      onError?.(error?.message || "Failed to generate speech");
      return;
    }

    // Cache the audio for future requests, using the cache key that includes speech rate
    ttsCache.set(cacheKey, language, data.audioContent);

    // Track usage for analytics
    trackTTSUsage(language, text.length);

    // Play the audio
    return playAudioFromBase64(data.audioContent, onStart, onEnd, onError);
  } catch (err: any) {
    console.error("TTS error:", err);
    onError?.(err?.message || "Failed to generate speech");
  }
};

/**
 * Preload TTS audio for future use
 */
export const preloadTTS = async (text: string, language: string, isTargetLanguage = false, useMetaMms = false, speechRate = 1.0) => {
  if (!text || text.trim() === "") return;

  const cacheKey = `${speech_rate_${speechRate}}:${text}`;
  if (ttsCache.has(cacheKey, language)) {
    console.log("Audio already preloaded for", language, text.substring(0, 40) + "...");
    return;
  }

  try {
    // Note that we're still passing the Meta MMS flag,
    // but the Edge Function will always try Azure first
    const usesMetaMms = useMetaMms || !!metaMmsLanguageMap[language?.toLowerCase()];

    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: {
        text,
        language,
        isTargetLanguage,
        useMetaMms: usesMetaMms,
        speechRate: speechRate
      },
    });

    if (error || !data?.audioContent) {
      console.error("Preload TTS error from Supabase:", error || "No audio content returned");
      return;
    }

    // Cache the audio
    ttsCache.set(cacheKey, language, data.audioContent);
    console.log("Successfully preloaded audio for", language, text.substring(0, 40) + "...");
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
