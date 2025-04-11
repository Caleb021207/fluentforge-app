
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { SpeechRecognitionOptions, SpeechRecognitionResult } from "./speech-recognition/types";
import { isBrowserSpeechSupported, createBrowserRecognition, useHandleRecognitionError } from "./speech-recognition/browser-recognition";
import { useMediaRecording } from "./speech-recognition/fallback-recognition";
import { useSilenceDetection } from "./speech-recognition/silence-detection";

export const useSpeechRecognition = ({
  onTranscriptChange,
  onSilence,
  onError,
  silenceTimeout = 10000,
  language = 'en-US'
}: SpeechRecognitionOptions): SpeechRecognitionResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setLocalTranscript] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const languageRef = useRef(language);
  
  const { toast } = useToast();
  const { t } = useLocalization();
  const handleRecognitionError = useHandleRecognitionError();
  
  // Apply the transcript update and trigger the callback
  const updateTranscript = (text: string) => {
    setLocalTranscript(text);
    if (onTranscriptChange) {
      onTranscriptChange(text);
    }
  };
  
  const { resetSilenceDetection, clearSilenceDetection } = useSilenceDetection(
    silenceTimeout,
    onSilence && isListening ? () => {
      if (onSilence && transcript.trim().length > 0) {
        onSilence();
      }
      stopListening();
    } : undefined
  );
  
  const {
    isRecording,
    audioChunks,
    startMediaRecording,
    stopMediaRecording,
    processFallbackRecording,
    setAudioChunks
  } = useMediaRecording(language, updateTranscript, resetSilenceDetection);
  
  // Update language reference when it changes
  useEffect(() => {
    if (language !== languageRef.current) {
      console.log(`Speech recognition language changed from ${languageRef.current} to ${language}`);
      languageRef.current = language;
      
      if (isListening && recognitionRef.current && !useFallback) {
        try {
          recognitionRef.current.abort();
          initializeRecognition();
          recognitionRef.current.start();
          console.log(`Restarted speech recognition with new language: ${language}`);
        } catch (e) {
          console.error("Failed to restart speech recognition with new language:", e);
          // Switch to fallback if browser API fails
          switchToFallback();
        }
      }
    }
  }, [language]);
  
  // Process audio chunks whenever they're updated
  useEffect(() => {
    if (audioChunks.length > 0 && isListening && useFallback) {
      processFallbackRecording();
    }
  }, [audioChunks]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting speech recognition:", e);
        }
      }
      stopMediaRecording();
      clearSilenceDetection();
    };
  }, []);

  const switchToFallback = () => {
    console.log("Switching to server-side transcription fallback");
    setUseFallback(true);
    
    // Stop any existing browser recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error("Error stopping browser recognition:", e);
      }
    }
    
    if (isListening) {
      // Start recording with MediaRecorder instead
      startMediaRecording();
    }
  };

  const initializeRecognition = () => {
    if (!isBrowserSpeechSupported()) {
      console.log("Browser speech recognition not supported, using fallback");
      return false;
    }
    
    const recognition = createBrowserRecognition(
      languageRef.current,
      updateTranscript,
      resetSilenceDetection,
      (error, event) => {
        const shouldSwitchToFallback = handleRecognitionError(error, event, onError);
        if (shouldSwitchToFallback) {
          switchToFallback();
        }
      }
    );
    
    if (!recognition) {
      return false;
    }
    
    recognitionRef.current = recognition;
    
    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended, isListening state:", isListening);
      if (isListening && !useFallback) {
        try {
          recognitionRef.current.start();
          console.log("Restarted speech recognition");
        } catch (e) {
          console.error("Failed to restart speech recognition:", e);
          switchToFallback();
        }
      }
    };
    
    return true;
  };

  const startListening = () => {
    if (isListening) {
      console.log("Already listening, ignoring startListening call");
      return;
    }
    
    console.log(`Starting speech recognition with language: ${language}`);
    setIsListening(true);
    
    // Clear the transcript when starting a new session
    updateTranscript("");
    
    if (useFallback || !isBrowserSpeechSupported()) {
      // Use the server-side transcription fallback
      startMediaRecording();
      return;
    }
    
    // Try browser's SpeechRecognition first
    if (!recognitionRef.current || recognitionRef.current.lang !== languageRef.current) {
      const initialized = initializeRecognition();
      if (!initialized) {
        // If initialization fails, switch to fallback
        switchToFallback();
        return;
      }
    }
    
    try {
      recognitionRef.current.start();
      console.log(`Started speech recognition with language: ${languageRef.current}`);
      resetSilenceDetection();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      
      // If browser API fails, try the fallback
      switchToFallback();
    }
  };

  const stopListening = () => {
    if (!isListening) {
      console.log("Not listening, ignoring stopListening call");
      return;
    }
    
    console.log("Stopping speech recognition");
    
    if (!useFallback && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        console.log("Stopped browser speech recognition");
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    } else if (useFallback) {
      stopMediaRecording();
      // Process any remaining chunks
      if (audioChunks.length > 0) {
        processFallbackRecording();
      }
    }
    
    clearSilenceDetection();
    setIsListening(false);
  };

  return { 
    isListening, 
    startListening, 
    stopListening,
    usingFallback: useFallback,
    transcript: transcript
  };
};
