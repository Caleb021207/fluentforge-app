
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseSpeechRecognitionProps {
  onTranscriptChange: (transcript: string) => void;
  onSilence?: () => void;
  silenceTimeout?: number;
  language?: string;
}

export const useSpeechRecognition = ({
  onTranscriptChange,
  onSilence,
  silenceTimeout = 10000,
  language = 'en-US'
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.lang = language;
      console.log(`Setting speech recognition language to: ${language}`);
      
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        
        resetSilenceDetection();
        onTranscriptChange(latestTranscript);
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
  }, [t, toast, isListening, language, onTranscriptChange]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    if (onSilence) {
      silenceTimeoutRef.current = window.setTimeout(() => {
        if (isListening) {
          console.log(`${silenceTimeout/1000} seconds of silence detected, automatically sending message`);
          onSilence();
          
          if (recognitionRef.current) {
            recognitionRef.current.abort();
          }
          setIsListening(false);
        }
      }, silenceTimeout);
    }
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
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
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    clearSilenceDetection();
    setIsListening(false);
  };

  return { 
    isListening, 
    startListening, 
    stopListening
  };
};
