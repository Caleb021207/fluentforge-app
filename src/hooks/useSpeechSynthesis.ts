
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageCodeForSpeech, getISOLanguageCode } from "@/utils/languageUtils";

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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        console.log("Speech synthesis voices loaded:", voices.length);
        voices.forEach(voice => {
          console.log(`Voice: ${voice.name}, Lang: ${voice.lang}, Default: ${voice.default}`);
        });
      };
      
      // Load voices immediately if they're already available
      if (synthRef.current.getVoices().length > 0) {
        loadVoices();
      }
      
      // Also set up the event for when voices are loaded asynchronously
      synthRef.current.onvoiceschanged = loadVoices;
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
    
    return () => {
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const findVoiceForLanguage = (languageName: string): SpeechSynthesisVoice | null => {
    if (!synthRef.current || availableVoices.length === 0) {
      console.warn("Speech synthesis not initialized or no voices available");
      return null;
    }
    
    // Get the ISO language code for the specified language
    const isoLangCode = getISOLanguageCode(languageName);
    console.log(`Finding voice for language: ${languageName} (ISO code: ${isoLangCode})`);
    
    // Look for exact language match first
    let voice = availableVoices.find(v => 
      v.lang.toLowerCase().startsWith(isoLangCode.toLowerCase()) && 
      (v.name.includes("Google") || v.name.includes("Natural"))
    );
    
    // If no exact match with preferred providers, look for any voice with matching language
    if (!voice) {
      voice = availableVoices.find(v => 
        v.lang.toLowerCase().startsWith(isoLangCode.toLowerCase())
      );
    }
    
    // If still no match, try to find a more generic voice for the language
    if (!voice) {
      // For Chinese, try alternatives
      if (isoLangCode === 'zh') {
        voice = availableVoices.find(v => 
          v.lang.includes("zh") || v.lang.includes("CN") || v.lang.includes("TW")
        );
      }
      // For other languages, just take any voice that starts with the language code
      else {
        voice = availableVoices.find(v => 
          v.lang.startsWith(isoLangCode)
        );
      }
    }
    
    // Last resort: use any available voice
    if (!voice && availableVoices.length > 0) {
      console.warn(`No voice found for ${languageName} (${isoLangCode}), using default voice`);
      // Try to find a default voice
      voice = availableVoices.find(v => v.default) || availableVoices[0];
    }
    
    if (voice) {
      console.log(`Selected voice for ${languageName}: ${voice.name} (${voice.lang})`);
    } else {
      console.error(`No voice could be found for ${languageName}`);
    }
    
    return voice;
  };

  const speak = (text: string, language?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current) {
        const errorMsg = "Speech synthesis not supported in this browser";
        console.error(errorMsg);
        toast({
          title: t("error"),
          description: t("speechSynthesisNotSupported"),
          variant: "destructive",
        });
        reject(new Error(errorMsg));
        return;
      }
      
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      // Clear any previous utterance
      utteranceRef.current = null;
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Set language based on provided language or current language
      const langToUse = language || currentLanguage;
      console.log(`Preparing speech for language: ${langToUse}`);
      
      // Get the BCP 47 language tag
      const langCode = getLanguageCodeForSpeech(langToUse);
      utterance.lang = langCode;
      console.log(`Using language code: ${langCode}`);
      
      // Find an appropriate voice
      const voice = findVoiceForLanguage(langToUse);
      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} (${voice.lang})`);
      } else {
        console.warn(`No voice found for ${langToUse}, using browser default`);
      }
      
      // Set event handlers
      utterance.onstart = () => {
        console.log("Speech synthesis started");
        setIsSpeaking(true);
        props?.onStart?.();
      };
      
      utterance.onend = () => {
        console.log("Speech synthesis ended");
        setIsSpeaking(false);
        props?.onEnd?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        props?.onError?.(event);
        toast({
          title: t("error"),
          description: t("audioPlaybackError"),
          variant: "destructive",
        });
        reject(event);
      };
      
      // Set rate and pitch for better speech quality
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Start speaking
      try {
        console.log("Starting speech synthesis...");
        synthRef.current.speak(utterance);
      } catch (error) {
        console.error("Error starting speech synthesis:", error);
        setIsSpeaking(false);
        toast({
          title: t("error"),
          description: t("audioPlaybackError"),
          variant: "destructive",
        });
        reject(error);
      }
    });
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const getAvailableVoicesForLanguage = (language: string) => {
    const isoCode = getISOLanguageCode(language);
    return availableVoices.filter(voice => 
      voice.lang.toLowerCase().startsWith(isoCode.toLowerCase())
    );
  };

  return {
    speak,
    cancel,
    isSpeaking,
    availableVoices,
    getAvailableVoicesForLanguage
  };
};
