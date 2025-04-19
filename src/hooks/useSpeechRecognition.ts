
import { useState, useRef, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { getLanguagePair } from "@/utils/languageUtils";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        const { practice } = getLanguagePair(currentLanguage);
        let recognitionLang = "es-ES"; // Default for English speakers learning Spanish
        
        if (currentLanguage === "english" && practice.toLowerCase() === "french") {
          recognitionLang = "fr-FR";
        } else if (currentLanguage !== "english") {
          recognitionLang = "en-US";
        }
        
        recognitionRef.current.lang = recognitionLang;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.continuous = true;
        recognitionRef.current.maxAlternatives = 1;
        
        recognitionRef.current.onresult = (event: any) => {
          const lastResultIndex = event.results.length - 1;
          const latestTranscript = event.results[lastResultIndex][0].transcript;
          resetSilenceDetection();
          setTranscript(latestTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          toast({
            title: t("error"),
            description: `${t("speechRecognitionError")}: ${event.error}`,
            variant: "destructive",
          });
        };
        
        recognitionRef.current.onend = () => {
          if (isListening) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart speech recognition:", e);
            }
          } else {
            setIsListening(false);
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
    };
  }, [currentLanguage, isListening, t, toast]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening) {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        setIsListening(false);
      }
    }, 10000);
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
          resetSilenceDetection();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          toast({
            title: t("error"),
            description: t("microphoneAccessRequired"),
            variant: "destructive",
          });
        }
      }
    }
  };

  return {
    isListening,
    transcript,
    toggleListening,
    setTranscript,
    clearSilenceDetection
  };
};
