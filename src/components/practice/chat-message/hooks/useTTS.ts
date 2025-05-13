
import { useState } from "react";
import { playTTS } from "@/utils/tts";
import type { TTSOptions } from "@/utils/tts/types";

interface UseTTSOptions {
  text: string;
  language: string;
  isTargetLanguage: boolean;
  speechRate?: number;
}

export const useTTS = ({ text, language, isTargetLanguage, speechRate = 1.0 }: UseTTSOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const playAudio = async () => {
    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      await playTTS({
        text,
        language,
        isTargetLanguage,
        speechRate,
        onStart: () => setIsLoading(false),
        onEnd: () => setIsPlaying(false),
        onError: (error) => {
          console.error(`TTS error (${isTargetLanguage ? 'target' : 'native'}):`, error);
          setIsPlaying(false);
          setIsLoading(false);
        }
      });
    } catch (error: any) {
      console.error(`Error playing ${isTargetLanguage ? 'target' : 'native'} audio:`, error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };
  
  return {
    isPlaying,
    isLoading,
    playAudio
  };
};

export default useTTS;
