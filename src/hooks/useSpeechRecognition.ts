import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getSpeechSynthesisLanguageCode } from "@/utils/languageUtils";
import { isSpeechRecognitionSupported, getBrowserInstructions } from "@/utils/browserUtils";

interface UseSpeechRecognitionProps {
  targetLanguage: string;
  onTranscriptChange?: (transcript: string) => void;
  onSilenceDetected?: (transcript: string) => void;
  silenceTimeout?: number; // in milliseconds
}

export const useSpeechRecognition = ({
  targetLanguage,
  onTranscriptChange,
  onSilenceDetected,
  silenceTimeout = 10000
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const micAccessGrantedRef = useRef<boolean>(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Effect to initialize speech recognition
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
    
    if (!supported) {
      console.warn("Speech Recognition is not supported in this browser");
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
      return;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    // Set recognition language
    const recognitionLanguage = getSpeechSynthesisLanguageCode(targetLanguage);
    recognitionRef.current.lang = recognitionLanguage;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;
    recognitionRef.current.maxAlternatives = 1;
    
    recognitionRef.current.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const latestTranscript = event.results[lastResultIndex][0].transcript;
      
      resetSilenceDetection();
      setTranscript(latestTranscript);
      
      if (onTranscriptChange) {
        onTranscriptChange(latestTranscript);
      }
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        micAccessGrantedRef.current = false;
      }
      
      // Only stop listening on critical errors
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        toast({
          title: t("error"),
          description: `${t("speechRecognitionError")}: ${event.error}`,
          variant: "destructive",
        });
      }
    };
    
    recognitionRef.current.onend = () => {
      // Only restart if we intend to keep listening and have permission
      if (isListening && micAccessGrantedRef.current) {
        try {
          // Small delay to prevent rapid restarts
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 300);
        } catch (e) {
          console.error("Failed to restart speech recognition:", e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting recognition on cleanup:", e);
        }
      }
      clearSilenceDetection();
    };
  }, [targetLanguage, toast, t]);
  
  // Effect to handle starting and stopping recognition based on isListening state
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("Speech recognition started");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    } else if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        clearSilenceDetection();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  }, [isListening]);

  const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      micAccessGrantedRef.current = true;
      return true;
    } catch (error) {
      console.error("Microphone access error:", error);
      micAccessGrantedRef.current = false;
      toast({
        title: t("microphoneAccessRequired"),
        description: t("allowMicAccess"),
        variant: "destructive",
      });
      return false;
    }
  };

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    if (!onSilenceDetected) return;
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (transcript && isListening && onSilenceDetected) {
        console.log(`${silenceTimeout/1000} seconds of silence detected, automatically sending message`);
        onSilenceDetected(transcript);
      }
    }, silenceTimeout);
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const startListening = async () => {
    if (isListening) return;
    
    if (!isSupported) {
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
      return;
    }

    // Request microphone access if not already granted
    if (!micAccessGrantedRef.current) {
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) return;
    }

    setTranscript("");
    setIsListening(true);
    resetSilenceDetection();
  };

  const stopListening = () => {
    if (!isListening) return;
    
    clearSilenceDetection();
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetSilenceDetection,
    clearSilenceDetection,
  };
};

export default useSpeechRecognition;
