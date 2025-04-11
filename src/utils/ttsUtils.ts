
import { supabase } from "@/integrations/supabase/client";

export interface TTSOptions {
  text: string;
  language: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Plays text using the Supabase Edge Function for OpenAI TTS.
 */
export const playTTS = async (options: TTSOptions): Promise<void> => {
  const { text, language, onStart, onEnd, onError } = options;
  
  if (!text || text.trim() === "") {
    onError?.(new Error("Empty text provided"));
    return;
  }
  
  onStart?.();
  
  try {
    console.log(`Sending TTS request for language: ${language}, text length: ${text.length}`);
    
    // Call the Supabase Edge Function for TTS
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
 * Basic browser TTS detection - just for feature detection, not for actual use
 */
export const isTTSSupported = (): boolean => {
  return typeof window !== 'undefined';
};
