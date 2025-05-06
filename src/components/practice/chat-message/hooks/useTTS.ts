
import { useState } from "react";
import { playTTS } from "@/utils/tts";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { TTSOptions } from "@/utils/tts/types";

interface UseTTSOptions {
  text: string;
  language: string;
  isTargetLanguage: boolean;
}

export const useTTS = ({ text, language, isTargetLanguage }: UseTTSOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const playAudio = async () => {
    if (!text || isPlaying) return;
    
    setIsLoading(true);
    setHasError(false);
    setIsPlaying(true);
    
    try {
      await playTTS({
        text,
        language,
        isTargetLanguage,
        onStart: () => {
          setIsLoading(false);
          console.log(`Started playing ${isTargetLanguage ? 'target' : 'native'} audio`);
        },
        onEnd: () => {
          setIsPlaying(false);
          console.log(`Finished playing ${isTargetLanguage ? 'target' : 'native'} audio`);
        },
        onError: (error) => {
          console.error(`TTS error (${isTargetLanguage ? 'target' : 'native'}):`, error);
          setIsPlaying(false);
          setIsLoading(false);
          setHasError(true);
          
          toast({
            title: t("speechSynthesisError"),
            description: typeof error === 'string' ? error : t("failedToGenerateSpeech"),
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      console.error(`Error playing ${isTargetLanguage ? 'target' : 'native'} audio:`, error);
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
      
      toast({
        title: t("speechSynthesisError"),
        description: error?.message || t("failedToGenerateSpeech"),
        variant: "destructive",
      });
    }
  };
  
  const cancelAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsLoading(false);
    }
  };
  
  return {
    isPlaying,
    isLoading,
    hasError,
    playAudio,
    cancelAudio
  };
};

export default useTTS;
