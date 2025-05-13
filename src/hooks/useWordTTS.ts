
import { useState } from "react";
import { playTTS } from "@/utils/tts";
import { ttsCache } from "@/utils/tts/cache";

interface UseWordTTSOptions {
  language: string;
  isTargetLanguage?: boolean;
  speechRate?: number;
}

export const useWordTTS = ({ 
  language, 
  isTargetLanguage = true,
  speechRate = 1.0 
}: UseWordTTSOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  
  const playWordAudio = async (word: string) => {
    if (isPlaying || isLoading) return;
    
    setIsLoading(true);
    setCurrentWord(word);
    
    try {
      await playTTS({
        text: word,
        language,
        isTargetLanguage,
        speechRate,
        onStart: () => {
          setIsLoading(false);
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPlaying(false);
          setCurrentWord(null);
        },
        onError: (error) => {
          console.error(`Word TTS error:`, error);
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentWord(null);
        }
      });
    } catch (error: any) {
      console.error(`Error playing word audio:`, error);
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentWord(null);
    }
  };
  
  // Preload audio for a list of words
  const preloadWords = async (words: string[]) => {
    for (const word of words) {
      const cacheKey = `speech_rate_${speechRate}:${word}`;
      if (!ttsCache.has(cacheKey, language)) {
        try {
          await playTTS({
            text: word,
            language,
            isTargetLanguage,
            speechRate,
            onStart: () => {},
            onEnd: () => {},
            onError: () => {}
          });
        } catch (error) {
          console.error(`Error preloading word "${word}":`, error);
        }
      }
    }
  };
  
  return {
    isPlaying,
    isLoading,
    currentWord,
    playWordAudio,
    preloadWords
  };
};
