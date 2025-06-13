import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getSpeechSynthesisLanguageCode } from "@/utils/languageUtils";

interface UseRealTimeTranscriptionProps {
  targetLanguage: string;
  onTranscriptComplete?: (transcript: string) => void;
  isEnabled?: boolean;
}

export const useRealTimeTranscription = ({ 
  targetLanguage,
  onTranscriptComplete,
  isEnabled = false
}: UseRealTimeTranscriptionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Use refs to prevent race conditions
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const silenceTimeoutRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef<string>("");
  
  // Clean up function that properly stops recognition and clears timeouts
  const cleanUpRecognition = useCallback(() => {
    console.log("Cleaning up pronunciation recognition...");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    
    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);
    setIsInitializing(false);
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
    
    console.log(`Initializing pronunciation recognition for ${targetLanguage} (${recognitionLanguage})`);
    
    recognition.onresult = (event: any) => {
      if (!isListeningRef.current) return;
      
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update the displayed transcript with both final and interim results
      const displayTranscript = finalTranscriptRef.current + finalTranscript + interimTranscript;
      setTranscript(displayTranscript);
      
      // Store final results
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        console.log("Final transcript updated:", finalTranscriptRef.current);
      }
      
      // Reset silence timer on any speech
      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
      }
      
      // Set timer to detect end of speech (2 seconds of silence)
      silenceTimeoutRef.current = window.setTimeout(() => {
        if (isListeningRef.current && finalTranscriptRef.current.trim()) {
          console.log("Silence detected, completing transcription:", finalTranscriptRef.current);
          if (onTranscriptComplete) {
            onTranscriptComplete(finalTranscriptRef.current.trim());
          }
          cleanUpRecognition();
        }
      }, 2000);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      cleanUpRecognition();
      
      if (event.error === 'not-allowed') {
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      } else if (event.error !== 'aborted') {
        toast({
          title: t("error"),
          description: `${t("speechRecognitionError")}: ${event.error}`,
          variant: "destructive",
        });
      }
    };
    
    recognition.onend = () => {
      console.log("Recognition ended");
      // Only attempt to restart if we're still supposed to be listening and haven't completed
      if (isListeningRef.current && !finalTranscriptRef.current.trim()) {
        try {
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.error("Failed to restart speech recognition:", e);
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
    
    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsInitializing(false);
    };
    
    return recognition;
  }, [targetLanguage, toast, t, onTranscriptComplete, cleanUpRecognition]);

  // Set up and clean up on mount/unmount
  useEffect(() => {
    return () => {
      cleanUpRecognition();
    };
  }, [cleanUpRecognition]);

  const startListening = useCallback(() => {
    if (isInitializing || isListening) {
      console.log("Cannot start while initializing or already listening");
      return;
    }
    
    console.log("Starting pronunciation transcription");
    setIsInitializing(true);
    
    // Reset all state
    setTranscript("");
    finalTranscriptRef.current = "";
    
    try {
      // Clean up any existing instances first
      cleanUpRecognition();
      
      // Initialize and start a new instance
      recognitionRef.current = initRecognition();
      
      if (recognitionRef.current) {
        isListeningRef.current = true;
        setIsListening(true);
        
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          cleanUpRecognition();
          
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
      
      toast({
        title: t("error"),
        description: t("microphoneAccessRequired"),
        variant: "destructive",
      });
    }
  }, [isInitializing, isListening, initRecognition, cleanUpRecognition, toast, t]);

  const stopListening = useCallback(() => {
    console.log("Stopping pronunciation transcription");
    
    // If we have a final transcript, send it immediately
    if (finalTranscriptRef.current.trim() && onTranscriptComplete) {
      onTranscriptComplete(finalTranscriptRef.current.trim());
    }
    
    cleanUpRecognition();
  }, [cleanUpRecognition, onTranscriptComplete]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  return {
    isListening,
    isInitializing,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  };
};