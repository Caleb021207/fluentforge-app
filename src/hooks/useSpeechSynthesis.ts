
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseSpeechSynthesisProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export const useSpeechSynthesis = (props?: UseSpeechSynthesisProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { t, currentLanguage } = useLocalization();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const handleVoicesChanged = () => {
        console.log("Voices available:", synthRef.current?.getVoices().length);
      };
      
      synthRef.current.onvoiceschanged = handleVoicesChanged;
      
      if (synthRef.current.getVoices().length > 0) {
        handleVoicesChanged();
      }
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
    
    return () => {
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const getVoiceForLanguage = (language: string) => {
    if (!synthRef.current) return null;
    
    const voices = synthRef.current.getVoices();
    console.log("Finding voice for language:", language);
    
    // Map current language to target language code
    let targetLangCode: string;
    
    switch (language.toLowerCase()) {
      case "english":
        targetLangCode = "en";
        break;
      case "spanish":
        targetLangCode = "es";
        break;
      case "french":
        targetLangCode = "fr";
        break;
      case "portuguese":
        targetLangCode = "pt";
        break;
      case "mandarin":
        targetLangCode = "zh";
        break;
      case "japanese":
        targetLangCode = "ja";
        break;
      default:
        targetLangCode = "en";
        break;
    }
    
    // Log available voices for debugging
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    
    // Try to find a voice for the target language
    let voice = voices.find(v => v.lang.startsWith(targetLangCode));
    
    // If no voice found, use default
    if (!voice && voices.length > 0) {
      console.warn(`No voice found for ${targetLangCode}, using default voice`);
      voice = voices[0];
    }
    
    return voice;
  };

  const speak = (text: string, language?: string) => {
    if (!synthRef.current) {
      toast({
        title: t("error"),
        description: t("speechSynthesisNotSupported"),
        variant: "destructive",
      });
      return;
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Create new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    // Set language based on provided language or current language
    const langToUse = language || currentLanguage;
    const voice = getVoiceForLanguage(langToUse);
    
    if (voice) {
      utteranceRef.current.voice = voice;
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
    }
    
    // Set event handlers
    utteranceRef.current.onstart = () => {
      console.log("Speech synthesis started");
      setIsSpeaking(true);
      props?.onStart?.();
    };
    
    utteranceRef.current.onend = () => {
      console.log("Speech synthesis ended");
      setIsSpeaking(false);
      props?.onEnd?.();
    };
    
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      props?.onError?.(event);
      toast({
        title: t("error"),
        description: t("audioPlaybackError"),
        variant: "destructive",
      });
    };
    
    // Start speaking
    synthRef.current.speak(utteranceRef.current);
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    cancel,
    isSpeaking
  };
};
