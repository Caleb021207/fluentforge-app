
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { playTTS } from "@/utils/tts";

interface UseVoiceTTSProps {
  practiceLanguage: string;
  speechRate?: number;
}

export const useVoiceTTS = ({ practiceLanguage, speechRate = 1.0 }: UseVoiceTTSProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithAzureTTS = async (text: string): Promise<void> => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithAzureTTS');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..." in language: ${practiceLanguage.toLowerCase()}`);
    
    setIsSpeaking(true);
    
    return new Promise((resolve) => {
      playTTS({
        text: text,
        language: practiceLanguage.toLowerCase(),
        speechRate: speechRate,
        onStart: () => {
          console.log("TTS started with OpenAI - audio loaded and ready");
          setIsSpeaking(true);
          resolve(); // Resolve when audio is loaded and starts playing
        },
        onEnd: () => {
          console.log("TTS ended");
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error("TTS error:", error);
          setIsSpeaking(false);
          toast({
            title: t("error"),
            description: t("failedToGenerateSpeech"),
            variant: "destructive",
          });
          resolve(); // Resolve even on error so we don't block the UI
        }
      });
    });
  };

  return {
    speakWithAzureTTS,
    isSpeaking
  };
};
