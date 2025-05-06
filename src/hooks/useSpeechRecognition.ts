
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface SpeechRecognitionOptions {
  language: string;
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onSilence?: () => void;
  silenceTimeout?: number; // silence timeout in ms
}

export enum RecognitionState {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  ERROR = 'error'
}

export const useSpeechRecognition = ({
  language,
  onResult,
  onError,
  onSilence,
  silenceTimeout = 10000 // 10 seconds default
}: SpeechRecognitionOptions) => {
  const [state, setState] = useState<RecognitionState>(RecognitionState.IDLE);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const lastTranscriptRef = useRef<string>("");
  const silenceTimerRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsAvailable(false);
      return;
    }

    setIsAvailable(true);
    
    // Create speech recognition instance
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    // Set up event handlers
    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      
      // Save transcript
      lastTranscriptRef.current = transcript;
      
      // Report result
      onResult(transcript);
      
      // Reset silence detection
      resetSilenceDetection();
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === 'network') {
        setState(RecognitionState.ERROR);
        onError("Network connection issue");
      } else {
        onError(`Error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      // Recognition service has disconnected
      
      if (state === RecognitionState.LISTENING) {
        // Only attempt restart if we're supposed to be listening
        setState(RecognitionState.PROCESSING);
        
        // Clear any existing restart timer
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current);
        }
        
        // Set up a timer with exponential backoff
        const delay = Math.min(1500 + (retryCountRef.current * 500), 4000);
        
        restartTimerRef.current = window.setTimeout(() => {
          // Fix: Use strict equality check for each state separately
          if (state === RecognitionState.PROCESSING || state === RecognitionState.LISTENING) {
            try {
              recognition.start();
              retryCountRef.current++;
              setState(RecognitionState.LISTENING);
            } catch (e) {
              console.error("Failed to restart speech recognition:", e);
              setState(RecognitionState.ERROR);
              onError("Failed to restart speech recognition");
            }
          }
          restartTimerRef.current = null;
        }, delay);
      }
    };
    
    recognition.onstart = () => {
      setState(RecognitionState.LISTENING);
    };
    
    // Store the recognition instance
    recognitionRef.current = recognition;
    
    // Cleanup function
    return () => {
      stopRecognition();
      clearSilenceDetection();
      clearRestartTimer();
    };
  }, [language]);

  // Handle silence detection
  const resetSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = window.setTimeout(() => {
      if (state === RecognitionState.LISTENING && lastTranscriptRef.current && onSilence) {
        onSilence();
      }
    }, silenceTimeout);
  }, [state, silenceTimeout, onSilence]);

  const clearSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  // Start recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) return false;
    
    try {
      recognitionRef.current.start();
      setState(RecognitionState.LISTENING);
      resetSilenceDetection();
      retryCountRef.current = 0;
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setState(RecognitionState.ERROR);
      onError("Failed to start microphone");
      return false;
    }
  }, [resetSilenceDetection, onError]);

  // Stop recognition
  const stopRecognition = useCallback(() => {
    clearSilenceDetection();
    clearRestartTimer();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors on stop
      }
    }
    
    setState(RecognitionState.IDLE);
  }, [clearSilenceDetection, clearRestartTimer]);

  // Get the current transcript
  const getTranscript = useCallback(() => {
    return lastTranscriptRef.current;
  }, []);

  // Clear the current transcript
  const clearTranscript = useCallback(() => {
    lastTranscriptRef.current = "";
  }, []);

  return {
    isAvailable,
    state,
    startRecognition,
    stopRecognition,
    getTranscript,
    clearTranscript
  };
};
