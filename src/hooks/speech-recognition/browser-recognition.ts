
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

// Check if browser supports SpeechRecognition
export const isBrowserSpeechSupported = () => {
  return typeof window !== "undefined" && 
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Helper function to get standardized language code
export const getStandardizedLanguageCode = (language: string): string => {
  if (!language) return 'en-US';
  
  // Make sure we have correct format like 'en-US', 'fr-FR', etc.
  if (language.includes('-')) {
    return language;
  }
  
  // Map of language codes to standardized formats
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'pt': 'pt-PT',
    'es': 'es-ES',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'ru': 'ru-RU',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
    'vi': 'vi-VN'
  };
  
  return languageMap[language.toLowerCase()] || `${language}-${language.toUpperCase()}`;
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
    
    // Standardize language code
    const standardizedLanguage = getStandardizedLanguageCode(language);
    recognition.lang = standardizedLanguage;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    console.log(`Speech recognition initialized with language: ${standardizedLanguage}`);
    
    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const latestTranscript = event.results[lastResultIndex][0].transcript;
      
      console.log(`Speech recognition result: "${latestTranscript}"`);
      resetSilenceDetection();
      onTranscriptChange(latestTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error(`Speech recognition error: ${event.error}`, event);
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
    let shouldSwitchToFallback = true;
    
    if (error === 'not-allowed') {
      errorMessage = t("microphoneAccessRequired");
    } else if (error === 'no-speech') {
      errorMessage = t("noSpeechDetected");
      shouldSwitchToFallback = false; // No need to switch for no speech
    } else if (error === 'language-not-supported') {
      errorMessage = `Language not supported: ${event?.message || "The selected language is not supported by your browser"}`;
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
    
    // Return whether we should switch to the fallback
    return shouldSwitchToFallback;
  };
};
