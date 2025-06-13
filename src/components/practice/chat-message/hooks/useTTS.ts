
import { useState } from "react";
import { playTTS } from "@/utils/tts";
import type { TTSOptions } from "@/utils/tts/types";

interface UseTTSOptions {
  text: string;
  language: string;
}

export const useTTS = ({ text, language }: UseTTSOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const playAudio = async () => {
    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      await playTTS({
        text,
        language,
        onStart: () => setIsLoading(false),
        onEnd: () => setIsPlaying(false),
        onError: (error) => {
          console.error('TTS error:', error);
          setIsPlaying(false);
          setIsLoading(false);
        }
      });
    } catch (error: any) {
      console.error('Error playing audio:', error);
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
