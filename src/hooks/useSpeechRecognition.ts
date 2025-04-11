import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseSpeechRecognitionProps {
  onTranscriptChange: (transcript: string) => void;
  onSilence?: () => void;
  onError?: (errorMessage: string) => void;
  silenceTimeout?: number;
  language?: string;
}

export const useSpeechRecognition = ({
  onTranscriptChange,
  onSilence,
  onError,
  silenceTimeout = 10000,
  language = 'en-US'
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const languageRef = useRef(language);
  
  useEffect(() => {
    if (language !== languageRef.current) {
      console.log(`Speech recognition language changed from ${languageRef.current} to ${language}`);
      languageRef.current = language;
      
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          initializeRecognition();
          recognitionRef.current.start();
          console.log(`Restarted speech recognition with new language: ${language}`);
        } catch (e) {
          console.error("Failed to restart speech recognition with new language:", e);
        }
      }
    }
  }, [language]);

  const handleRecognitionError = (error: string, event?: any) => {
    console.error(`Speech recognition error: ${error}`, event);
    
    let errorMessage = t("speechRecognitionError");
    
    if (error === 'not-allowed') {
      errorMessage = t("microphoneAccessRequired");
    } else if (error === 'no-speech') {
      errorMessage = t("noSpeechDetected");
    } else if (error === 'aborted') {
      return;
    } else {
      errorMessage = `${t("speechRecognitionError")}: ${error}`;
    }
    
    if (onError) {
      onError(errorMessage);
    } else {
      toast({
        title: t("error"),
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setIsListening(false);
  };

  const initializeRecognition = () => {
    if (typeof window === "undefined" || 
        !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser");
      return false;
    }
      
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting existing speech recognition:", e);
        }
      }
      
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.lang = languageRef.current;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.maxAlternatives = 1;
      
      console.log(`Speech recognition initialized with language: ${languageRef.current}`);
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        
        resetSilenceDetection();
        onTranscriptChange(latestTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        handleRecognitionError(event.error, event);
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended, isListening state:", isListening);
        if (isListening) {
          try {
            recognitionRef.current.start();
            console.log("Restarted speech recognition");
          } catch (e) {
            console.error("Failed to restart speech recognition:", e);
            setIsListening(false);
          }
        }
      };
      
      return true;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return false;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const errorMessage = t("speechRecognitionNotSupported");
        if (onError) {
          onError(errorMessage);
        } else {
          toast({
            title: t("error"),
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }
      
      initializeRecognition();
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
  }, [t, toast, onError]);

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
    if (isListening) {
      console.log("Already listening, ignoring startListening call");
      return;
    }
    
    if (typeof window === "undefined" || 
        !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const errorMessage = t("speechRecognitionNotSupported");
      if (onError) {
        onError(errorMessage);
      } else {
        toast({
          title: t("error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
      return;
    }
    
    if (!recognitionRef.current || recognitionRef.current.lang !== languageRef.current) {
      const initialized = initializeRecognition();
      if (!initialized) {
        return;
      }
    }
    
    try {
      recognitionRef.current.start();
      console.log(`Started speech recognition with language: ${languageRef.current}`);
      setIsListening(true);
      resetSilenceDetection();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      
      const errorMessage = t("microphoneAccessRequired");
      if (onError) {
        onError(errorMessage);
      } else {
        toast({
          title: t("error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
      
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
