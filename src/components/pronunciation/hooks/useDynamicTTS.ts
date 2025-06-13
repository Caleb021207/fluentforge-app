import { useState } from "react";
import { playTTS } from "@/utils/tts";

interface UseDynamicTTSProps {
  language: string;
  speechRate?: number;
}

export const useDynamicTTS = ({ language, speechRate = 1.0 }: UseDynamicTTSProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState<string>("");
  
  const playText = async (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to playText');
      return;
    }

    setCurrentText(text);
    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      await playTTS({
        text,
        language,
        speechRate,
        onStart: () => setIsLoading(false),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentText("");
        },
        onError: (error) => {
          console.error('TTS error:', error);
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentText("");
        }
      });
    } catch (error: any) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentText("");
    }
  };
  
  return {
    isPlaying,
    isLoading,
    currentText,
    playText
  };
};

export default useDynamicTTS;