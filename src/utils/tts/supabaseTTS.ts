
import { supabase } from "@/integrations/supabase/client";
import { ttsCache } from "./cache";
import { useBrowserTTS } from "./browserTTS";
import { trackTTSUsage } from "./tracking";
import type { TTSOptions } from "./types";

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

  // Check for existing cached audio for this text
  const cachedAudio = ttsCache.get(text, language);

  if (cachedAudio) {
    console.log("Using cached audio for text:", text.substring(0, 40) + "...");
    return playAudioFromBase64(cachedAudio, onStart, onEnd, onError);
  }

  try {
    // Call the Supabase Edge Function (OpenAI TTS)
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: {
        text,
        voice,
        speechRate
      },
    });

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

    // Cache the audio for future requests
    ttsCache.set(text, language, data.audioContent);

    // Track usage for analytics
    trackTTSUsage(language, text.length);

    // Play the audio
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

  if (ttsCache.has(text, language)) {
    console.log("Audio already preloaded for text:", text.substring(0, 40) + "...");
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: {
        text,
        voice,
        speechRate
      },
    });

    if (error || !data?.audioContent) {
      console.error("Preload TTS error from Supabase:", error || "No audio content returned");
      return;
    }

    // Cache the audio
    ttsCache.set(text, language, data.audioContent);
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
