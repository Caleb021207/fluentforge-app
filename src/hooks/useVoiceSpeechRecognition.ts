
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
  const finalTranscriptRef = useRef<string>("");  // Accumulate finalized speech
  
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
      
      // Accumulate all finalized results
      let finalTranscript = finalTranscriptRef.current;
      let interimTranscript = "";
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      // Update the ref with accumulated finalized text
      finalTranscriptRef.current = finalTranscript;
      
      // Combine finalized and interim for display
      const combinedTranscript = (finalTranscript + interimTranscript).trim();
      
      if (combinedTranscript) {
        // Reset silence detection timer
        if (autoSendTimeoutRef.current) {
          window.clearTimeout(autoSendTimeoutRef.current);
        }
        
        // Auto-send after 3 seconds of silence
        autoSendTimeoutRef.current = window.setTimeout(() => {
          if (isListeningRef.current && combinedTranscript && onSendTranscript) {
            // Stop recording before sending
            cleanUpRecognition();
            onSendTranscript(combinedTranscript);
            setTranscript("");
            finalTranscriptRef.current = "";
          }
        }, 3000);
        
        setTranscript(combinedTranscript);
        if (onTranscriptChange) {
          onTranscriptChange(combinedTranscript);
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      cleanUpRecognition();
      setIsInitializing(false);
      
      // Only show toast for critical errors, not for aborted/stopped recognition
      if (event.error === 'not-allowed') {
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        // Silent logging for aborted and no-speech errors (they're normal)
        console.warn('Speech recognition error (silent):', event.error);
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
      console.log("Stopping recording - keeping transcript");
      // Stop recording but DON'T clear transcript
      cleanUpRecognition();
    } else {
      console.log("Starting recording");
      setIsInitializing(true);
      
      // Reset transcripts when starting a new recording
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
    
    // CRITICAL: Stop recording immediately to prevent capturing TTS response
    cleanUpRecognition();
    
    if (autoSendTimeoutRef.current) {
      window.clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
    if (onSendTranscript) {
      onSendTranscript(text);
    }
    
    // Clear transcript and reset accumulator after sending
    setTranscript("");
    finalTranscriptRef.current = "";
  };

  return {
    isListening,
    isInitializing,
    transcript,
    toggleListening,
    handleSendTranscript,
    clearTranscript: () => {
      setTranscript("");
      finalTranscriptRef.current = "";
    }
  };
};
