import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Hook for speech recognition functionality
 */
export const useSpeechRecognition = (onTranscriptComplete: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.lang = currentLanguage === "english" ? "es-ES" : 
                                   currentLanguage === "japanese" ? "en-US" : 
                                   currentLanguage === "french" ? "en-US" : "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.continuous = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setTranscript(transcript);
        onTranscriptComplete(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          toast({
            title: t("error"),
            description: `${t("speechRecognitionError")}: ${event.error}`,
            variant: "destructive",
          });
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
            console.log("Speech recognition restarted automatically");
          } catch (error) {
            console.error("Failed to restart speech recognition:", error);
            setIsListening(false);
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
    };
  }, [currentLanguage, toast, t, onTranscriptComplete, isListening]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setTranscript("");
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
    setTranscript
  };
};
