
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

// Check if browser supports SpeechRecognition
export const isBrowserSpeechSupported = () => {
  return typeof window !== "undefined" && 
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const createBrowserRecognition = (
  language: string,
  onTranscriptChange: (transcript: string) => void,
  resetSilenceDetection: () => void,
  onError: (error: string, event?: any) => void
) => {
  if (!isBrowserSpeechSupported()) {
    return null;
  }
  
  try {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    console.log(`Speech recognition initialized with language: ${language}`);
    
    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const latestTranscript = event.results[lastResultIndex][0].transcript;
      
      resetSilenceDetection();
      onTranscriptChange(latestTranscript);
    };
    
    recognition.onerror = (event: any) => {
      onError(event.error, event);
    };
    
    return recognition;
  } catch (error) {
    console.error("Error initializing speech recognition:", error);
    return null;
  }
};

export const useHandleRecognitionError = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  
  return (error: string, event?: any, onError?: (errorMessage: string) => void) => {
    console.error(`Speech recognition error: ${error}`, event);
    
    // Don't show errors for aborted recognitions (normal operation)
    if (error === 'aborted') {
      return false;
    }
    
    let errorMessage = t("speechRecognitionError");
    
    if (error === 'not-allowed') {
      errorMessage = t("microphoneAccessRequired");
    } else if (error === 'no-speech') {
      errorMessage = t("noSpeechDetected");
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
    
    // If we get any error besides 'aborted', try switching to the fallback
    return true;
  };
};
