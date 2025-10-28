import { useState, useRef, useEffect } from "react";
import { playTTS } from "@/utils/tts";

interface UseDynamicTTSProps {
  language: string;
  speechRate?: number;
}

export const useDynamicTTS = ({ language, speechRate = 1.0 }: UseDynamicTTSProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Stop audio when speech rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentText("");
    }
  }, [speechRate]);
  
  const playText = async (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to playText');
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentText(text);
    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      const audio = await playTTS({
        text,
        language,
        speechRate,
        onStart: () => {
          setIsLoading(false);
          console.log('TTS started playing:', text);
        },
        onEnd: () => {
          setIsPlaying(false);
          setCurrentText("");
          audioRef.current = null;
          console.log('TTS ended:', text);
        },
        onError: (error) => {
          console.error('TTS error:', error);
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentText("");
          audioRef.current = null;
        }
      });
      
      // Store the audio element reference
      if (audio) {
        audioRef.current = audio;
      }
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