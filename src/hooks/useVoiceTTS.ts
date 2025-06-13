
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

  const speakWithAzureTTS = (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakWithAzureTTS');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..." in language: ${practiceLanguage.toLowerCase()}`);
    
    setIsSpeaking(true);
    
    playTTS({
      text: text,
      language: practiceLanguage.toLowerCase(),
      speechRate: speechRate,
      useMetaMms: false, // Use Azure as primary TTS provider
      onStart: () => {
        console.log("TTS started with Azure");
        setIsSpeaking(true);
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
      }
    });
  };

  return {
    speakWithAzureTTS,
    isSpeaking
  };
};
