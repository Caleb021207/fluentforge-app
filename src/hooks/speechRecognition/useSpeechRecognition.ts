
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { UseSpeechRecognitionOptions, UseSpeechRecognitionReturn } from "./types";

export const useSpeechRecognition = ({
  language,
  continuous = true,
  interimResults = true,
  onTranscript,
  onEnd,
  silenceTimeout = 30000,
  disableAutoStop = true  
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Check if speech recognition is supported
  useEffect(() => {
    const isAPISupported = 
      typeof window !== "undefined" && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
      
    setIsSupported(isAPISupported);
    
    if (!isAPISupported) {
      setError("Speech recognition not supported");
      toast({
        title: t("speechRecognitionError"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }
  }, [toast, t]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;
    
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        // Create new instance
        recognitionRef.current = new SpeechRecognitionAPI();
        
        if (recognitionRef.current) {
          recognitionRef.current.lang = language;
          recognitionRef.current.continuous = continuous;
          recognitionRef.current.interimResults = interimResults;
          recognitionRef.current.maxAlternatives = 1;
          
          console.log(`Speech recognition initialized with language: ${language}`);
        }
      }
    } catch (err) {
      console.error("Error initializing speech recognition:", err);
      setError("Failed to initialize speech recognition");
      setIsSupported(false);
    }
    
    // Cleanup function
    return () => {
      if (silenceTimeoutRef.current !== null) {
        window.clearTimeout(silenceTimeoutRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch (err) {
          console.error("Error cleaning up speech recognition:", err);
        }
      }
    };
  }, [isSupported, language, continuous, interimResults]);
  
  // Set up event handlers when listening state changes
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const transcriptText = event.results[lastResultIndex][0].transcript;
        const isFinal = event.results[lastResultIndex].isFinal;
        
        setTranscript(transcriptText);
        console.log(`Speech recognized: "${transcriptText}" (isFinal: ${isFinal})`);
        
        if (onTranscript) {
          onTranscript(transcriptText, isFinal);
        }
        
        // Reset silence detection
        if (!disableAutoStop && silenceTimeoutRef.current !== null) {
          window.clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = window.setTimeout(() => {
            if (isListening) {
              console.log("Silence detected, stopping speech recognition");
              setIsListening(false);
              
              if (onEnd) {
                onEnd();
              }
            }
          }, silenceTimeout);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        const errorCode = event.error;
        console.error("Speech recognition error:", errorCode);
        setError(errorCode);
        
        if (errorCode !== 'no-speech') {
          toast({
            title: t("speechRecognitionError"),
            description: getSpeechRecognitionErrorMessage(errorCode, t),
            variant: "destructive",
          });
        }
        
        if (['not-allowed', 'service-not-allowed', 'permission-denied'].includes(errorCode)) {
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        
        if (isListening) {
          // Try to restart
          try {
            recognitionRef.current?.start();
            console.log("Restarted speech recognition");
          } catch (err) {
            console.error("Failed to restart speech recognition:", err);
            setIsListening(false);
            
            if (onEnd) {
              onEnd();
            }
          }
        } else {
          if (onEnd) {
            onEnd();
          }
        }
      };
      
      try {
        recognitionRef.current.start();
        console.log("Speech recognition started");
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Failed to start speech recognition");
        setIsListening(false);
        
        toast({
          title: t("error"),
          description: t("microphoneAccessRequired"),
          variant: "destructive",
        });
      }
    } else if (recognitionRef.current) {
      // Stop listening
      try {
        console.log("Stopping speech recognition");
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
        
        try {
          recognitionRef.current.abort();
        } catch (abortErr) {
          console.error("Error aborting speech recognition:", abortErr);
        }
      }
      
      if (silenceTimeoutRef.current !== null) {
        window.clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }
  }, [isListening, isSupported, onTranscript, onEnd, toast, t, disableAutoStop, silenceTimeout]);
  
  const requestMicrophoneAccess = useCallback(async () => {
    try {
      console.log("Explicitly requesting microphone access...");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      return true;
    } catch (err) {
      console.error("Error requesting microphone access:", err);
      setError("Failed to access microphone");
      toast({
        title: t("error"),
        description: t("microphoneAccessRequired"),
        variant: "destructive",
      });
      return false;
    }
  }, [toast, t]);
  
  const startListening = async () => {
    if (isSupported) {
      console.log("Starting speech recognition");
      
      if (isListening) {
        console.log("Already listening, not starting again");
        return;
      }
      
      // Request microphone access
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) return;
      
      setError(null);
      setTranscript("");
      setIsListening(true);
    } else {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
    }
  };
  
  const stopListening = () => {
    console.log("Requesting to stop speech recognition");
    setIsListening(false);
    
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };
  
  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
    isSupported,
    requestMicrophoneAccess,
    availableDevices: []
  };
};

function getSpeechRecognitionErrorMessage(errorCode: string, t: any): string {
  const errorMessages: Record<string, string> = {
    'not-allowed': t("microphoneAccessDenied"),
    'audio-capture': t("microphoneNotFound"),
    'network': t("networkError"),
    'aborted': t("speechRecognitionAborted"),
    'no-speech': t("noSpeechDetected"),
    'language-not-supported': t("languageNotSupported"),
    'service-not-allowed': t("serviceNotAllowed"),
    'bad-grammar': t("grammarError"),
    'permission-denied': t("permissionDenied"),
    'not-supported': t("speechRecognitionNotSupported")
  };
  
  return errorMessages[errorCode] || `${t("unknownError")}: ${errorCode}`;
}
