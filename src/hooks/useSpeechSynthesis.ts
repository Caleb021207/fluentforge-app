
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseSpeechSynthesisProps {
  defaultLanguage?: string;
}

export const useSpeechSynthesis = ({
  defaultLanguage = 'en-US'
}: UseSpeechSynthesisProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  const speak = (text: string, langCode: string = defaultLanguage) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      toast({
        title: t("error"),
        description: t("speechSynthesisNotSupported"),
        variant: "destructive",
      });
      return;
    }
    
    synthRef.current.cancel();
    
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    utteranceRef.current.lang = langCode;
    console.log(`Setting speech synthesis language to: ${langCode}`);
    
    const voices = synthRef.current.getVoices();
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    
    const voiceLangPrefix = langCode.split('-')[0];
    const voice = voices.find(v => v.lang.startsWith(voiceLangPrefix));
    if (voice) {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
      utteranceRef.current.voice = voice;
    } else {
      console.warn(`No matching voice found for language: ${langCode}`);
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
