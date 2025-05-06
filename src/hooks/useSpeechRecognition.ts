
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseSpeechRecognitionOptions {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  autoRestart?: boolean;
}

export const useSpeechRecognition = ({
  language,
  continuous = true,
  interimResults = true,
  onTranscript,
  onEnd,
  autoRestart = true
}: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
        // Cleanup previous instance if it exists
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        }
        
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
        
        if (onTranscript) {
          onTranscript(transcriptText, isFinal);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(event.error);
        
        if (event.error !== 'no-speech') {
          toast({
            title: t("speechRecognitionError"),
            description: `${t("speechRecognitionError")}: ${event.error}`,
            variant: "destructive",
          });
        }
        
        // Don't automatically restart on certain errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        
        // If we're still in listening mode, try to restart
        if (isListening && autoRestart) {
          console.log("Attempting to restart speech recognition...");
          try {
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (err) {
            console.error("Failed to restart speech recognition:", err);
            setIsListening(false);
            setError("Failed to restart recognition");
            
            if (onEnd) {
              onEnd();
            }
          }
        } else {
          setIsListening(false);
          
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
      // Make sure we stop listening if the state is set to false
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped");
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
        
        // Try to abort as a backup plan
        try {
          recognitionRef.current.abort();
        } catch (abortErr) {
          console.error("Error aborting speech recognition:", abortErr);
        }
      }
    }
  }, [isListening, isSupported, autoRestart, onTranscript, onEnd, toast, t]);
  
  const startListening = () => {
    if (isSupported) {
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
    setIsListening(false);
  };
  
  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
    isSupported
  };
};
