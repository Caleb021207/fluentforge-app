
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { playTTS } from "@/utils/ttsUtils";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();

  const speakText = (text: string) => {
    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speakText');
      return;
    }

    console.log(`Speaking text: "${text.substring(0, 50)}..."`);
    
    const { practice } = getLanguagePair(currentLanguage);
    const practiceLanguage = practice.toLowerCase();
    
    setIsSpeaking(true);
    
    playTTS({
      text: text,
      language: practiceLanguage,
      onStart: () => {
        console.log("TTS started");
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

  return { isSpeaking, speakText };
};
