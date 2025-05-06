
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { playTTS } from "@/utils/ttsUtils";

interface UseAudioPlaybackProps {
  language: string;
}

export const useAudioPlayback = ({ language }: UseAudioPlaybackProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  const { practice } = getLanguagePair(language);
  const practiceLanguage = practice.toLowerCase();

  const speakText = (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speak');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..."`);
    setIsSpeaking(true);
    
    // Force the use of Meta MMS for special languages
    const useMetaMms = true;
    
    playTTS({
      text: text,
      language: practiceLanguage,
      isTargetLanguage: true,
      useMetaMms: useMetaMms,
      onStart: () => {
        console.log("TTS started with Meta MMS");
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
    isSpeaking,
    speakText
  };
};

export default useAudioPlayback;
