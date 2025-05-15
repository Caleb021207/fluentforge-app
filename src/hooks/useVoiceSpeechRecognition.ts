
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
  
  // Use refs to prevent race conditions
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const autoSendTimeoutRef = useRef<number | null>(null);
  
  // Clean up function that properly stops recognition and clears timeouts
  const cleanUpRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    
    if (autoSendTimeoutRef.current) {
      window.clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);
  }, []);
  
  // Initialize speech recognition with proper error handling
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
    recognition.lang = recognitionLanguage;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      if (!isListeningRef.current) return; // Skip if we've already stopped listening
      
      const lastResultIndex = event.results.length - 1;
      if (lastResultIndex >= 0 && event.results[lastResultIndex]) {
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        
        // Reset silence detection timer
        if (autoSendTimeoutRef.current) {
          window.clearTimeout(autoSendTimeoutRef.current);
        }
        
        autoSendTimeoutRef.current = window.setTimeout(() => {
          if (isListeningRef.current && latestTranscript && onSendTranscript) {
            onSendTranscript(latestTranscript);
            cleanUpRecognition();
          }
        }, 10000);
        
        setTranscript(latestTranscript);
        if (onTranscriptChange) {
          onTranscriptChange(latestTranscript);
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      cleanUpRecognition();
      setIsInitializing(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("error"),
          description: `${t("speechRecognitionError")}: ${event.error}`,
          variant: "destructive",
        });
      }
    };
    
    recognition.onend = () => {
      // Only attempt to restart if we're still supposed to be listening
      if (isListeningRef.current) {
        try {
          // Add a small delay before restarting to prevent rapid cycling
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.error("Failed to restart speech recognition after delay:", e);
                cleanUpRecognition();
              }
            }
          }, 300);
        } catch (e) {
          console.error("Failed to handle recognition onend event:", e);
          cleanUpRecognition();
        }
      } else {
        setIsInitializing(false);
      }
    };
    
    return recognition;
  }, [targetLanguage, toast, t, onTranscriptChange, onSendTranscript, cleanUpRecognition]);

  // Set up and clean up on mount/unmount
  useEffect(() => {
    return () => {
      cleanUpRecognition();
    };
  }, [cleanUpRecognition]);

  const toggleListening = () => {
    // Prevent rapid re-toggling
    if (isInitializing) {
      console.log("Cannot toggle while initializing");
      return;
    }
    
    if (isListening) {
      console.log("Stopping recording");
      cleanUpRecognition();
    } else {
      console.log("Starting recording");
      setIsInitializing(true);
      
      // Reset transcript when starting a new recording
      setTranscript("");
      
      try {
        // Clean up any existing instances first
        cleanUpRecognition();
        
        // Initialize and start a new instance
        recognitionRef.current = initRecognition();
        
        if (recognitionRef.current) {
          isListeningRef.current = true;
          setIsListening(true);
          
          // Explicitly catch start errors
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error("Error starting speech recognition:", error);
            cleanUpRecognition();
            setIsInitializing(false);
            
            toast({
              title: t("error"),
              description: t("microphoneAccessFailed"),
              variant: "destructive",
            });
            return;
          }
          
          // Set a timeout to clear initializing state if it gets stuck
          setTimeout(() => {
            setIsInitializing(false);
          }, 1000);
          
        } else {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error("Error setting up speech recognition:", error);
        cleanUpRecognition();
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
    
    if (autoSendTimeoutRef.current) {
      window.clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
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
