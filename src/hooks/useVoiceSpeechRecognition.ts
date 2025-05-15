
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getSpeechSynthesisLanguageCode } from "@/utils/languageUtils";

interface UseVoiceSpeechRecognitionProps {
  targetLanguage: string;
  onTranscriptChange?: (transcript: string) => void;
  onSendTranscript?: (transcript: string) => void;
}

export const useVoiceSpeechRecognition = ({ 
  targetLanguage,
  onTranscriptChange,
  onSendTranscript
}: UseVoiceSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const clickDebounceRef = useRef<number | null>(null);
  
  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser");
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
      return null;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    let recognitionLanguage = getSpeechSynthesisLanguageCode(targetLanguage.toLowerCase());
    
    console.log(`Setting speech recognition to target language: ${targetLanguage} (${recognitionLanguage})`);
    
    recognition.lang = recognitionLanguage;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const latestTranscript = event.results[lastResultIndex][0].transcript;
      
      resetSilenceDetection();
      
      setTranscript(latestTranscript);
      if (onTranscriptChange) {
        onTranscriptChange(latestTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setIsInitializing(false);
      
      toast({
        title: t("error"),
        description: `${t("speechRecognitionError")}: ${event.error}`,
        variant: "destructive",
      });
    };
    
    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart speech recognition:", e);
          setIsListening(false);
          setIsInitializing(false);
        }
      } else {
        setIsListening(false);
        setIsInitializing(false);
      }
    };
    
    return recognition;
  }, [targetLanguage, toast, t, isListening]);
  
  // Clean up function to properly stop recognition and clear timeouts
  const cleanUpRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
    }
    
    clearSilenceDetection();
    
    if (clickDebounceRef.current) {
      window.clearTimeout(clickDebounceRef.current);
      clickDebounceRef.current = null;
    }
  }, []);
  
  // Set up and clean up on mount/unmount
  useEffect(() => {
    return () => {
      cleanUpRecognition();
    };
  }, [cleanUpRecognition]);
  
  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening && onSendTranscript) {
        console.log("10 seconds of silence detected, automatically sending message");
        onSendTranscript(transcript);
        
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
    // Debounce to prevent rapid clicks
    if (clickDebounceRef.current || isInitializing) {
      console.log("Debouncing click or initialization in progress");
      return;
    }
    
    clickDebounceRef.current = window.setTimeout(() => {
      clickDebounceRef.current = null;
    }, 1000);
    
    if (isListening) {
      console.log("Stopping recording");
      cleanUpRecognition();
      setIsListening(false);
    } else {
      console.log("Starting recording");
      setIsInitializing(true);
      
      // Reset transcript when starting a new recording
      setTranscript("");
      
      // Clean up any existing instances
      cleanUpRecognition();
      
      // Initialize and start a new instance
      try {
        recognitionRef.current = initRecognition();
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
          resetSilenceDetection();
        } else {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsInitializing(false);
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
      }
    }
  };

  const handleSendTranscript = (text: string) => {
    if (!text.trim()) return;
    
    clearSilenceDetection();
    if (onSendTranscript) {
      onSendTranscript(text);
    }
    setTranscript("");
  };

  return {
    isListening,
    isInitializing,
    transcript,
    toggleListening,
    handleSendTranscript,
    clearTranscript: () => setTranscript("")
  };
};
