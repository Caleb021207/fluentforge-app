
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Hook for speech synthesis functionality
 */
export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  const initializeSynthesis = () => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const handleVoicesChanged = () => {
        console.log("Voices available:", synthRef.current?.getVoices().length);
      };
      
      synthRef.current.onvoiceschanged = handleVoicesChanged;
      
      if (synthRef.current.getVoices().length > 0) {
        handleVoicesChanged();
      }
      
      return true;
    } else {
      console.warn("Speech synthesis not supported in this browser");
      return false;
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) {
      if (!initializeSynthesis()) {
        toast({
          title: t("error"),
          description: t("speechSynthesisNotSupported"),
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!synthRef.current) {
      console.error('Speech synthesis still not available');
      return;
    }
    
    synthRef.current.cancel();
    
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    utteranceRef.current.lang = currentLanguage === "english" ? "es-ES" : 
                               currentLanguage === "japanese" ? "en-US" : "en-US";
    
    const voices = synthRef.current.getVoices();
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    
    const targetLang = currentLanguage === "english" ? "es" : "en";
    
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
      utteranceRef.current.voice = voice;
    } else {
      console.warn(`No matching voice found for language: ${targetLang}`);
    }
    
    utteranceRef.current.onstart = () => {
      console.log("Speech synthesis started");
      setIsSpeaking(true);
    };
    
    utteranceRef.current.onend = () => {
      console.log("Speech synthesis ended");
      setIsSpeaking(false);
    };
    
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      toast({
        title: t("error"),
        description: t("speechSynthesisError"),
        variant: "destructive",
      });
    };
    
    synthRef.current.speak(utteranceRef.current);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
    initializeSynthesis
  };
};
