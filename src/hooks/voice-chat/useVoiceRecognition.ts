
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.lang = currentLanguage === "english" ? "es-ES" : "en-US";
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        setTranscript(latestTranscript);
        resetSilenceDetection();
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
    } else {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
    };
  }, [currentLanguage, toast, t, isListening]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening) {
        console.log("10 seconds of silence detected");
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

  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearSilenceDetection();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
          resetSilenceDetection();
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
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
