
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

  // Initialize speech recognition only once
  useEffect(() => {
    if (typeof window !== "undefined" && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognitionAPI();
        console.log("Speech recognition initialized");
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting speech recognition:", e);
        }
      }
      clearSilenceDetection();
    };
  }, []);

  // Configure speech recognition when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
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
        if (event.error === 'not-allowed') {
          toast({
            title: t("error"),
            description: t("microphoneAccessRequired"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("error"),
            description: `${t("speechRecognitionError")}: ${event.error}`,
            variant: "destructive",
          });
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended, isListening:", isListening);
        if (isListening) {
          try {
            // Only restart if we're still supposed to be listening
            recognitionRef.current.start();
            console.log("Restarted speech recognition");
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
            setIsListening(false);
          }
        }
      };
      
      console.log(`Speech recognition configured with language: ${language}`);
    } else if (typeof window !== "undefined" && 
               !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }
  }, [language, isListening, t, toast, onTranscriptChange]);

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    if (onSilence) {
      silenceTimeoutRef.current = window.setTimeout(() => {
        if (isListening) {
          console.log(`${silenceTimeout/1000} seconds of silence detected, automatically sending message`);
          onSilence();
          
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch (e) {
              console.error("Error aborting speech recognition after silence:", e);
            }
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
    if (!recognitionRef.current) {
      if (typeof window !== "undefined" && 
          ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognitionAPI();
        console.log("Speech recognition initialized during startListening");
      } else {
        toast({
          title: t("error"),
          description: t("speechRecognitionNotSupported"),
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      recognitionRef.current.start();
      console.log("Started speech recognition");
      setIsListening(true);
      resetSilenceDetection();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: t("error"),
        description: t("microphoneAccessRequired"),
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        console.log("Stopped speech recognition");
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
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
