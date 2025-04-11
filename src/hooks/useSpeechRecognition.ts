
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

interface UseSpeechRecognitionProps {
  onTranscriptChange: (transcript: string) => void;
  onSilence?: () => void;
  onError?: (errorMessage: string) => void;
  silenceTimeout?: number;
  language?: string;
}

export const useSpeechRecognition = ({
  onTranscriptChange,
  onSilence,
  onError,
  silenceTimeout = 10000,
  language = 'en-US'
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const languageRef = useRef(language);
  
  // Check if browser supports SpeechRecognition
  const isBrowserSpeechSupported = () => {
    return typeof window !== "undefined" && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  };
  
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

  const handleRecognitionError = (error: string, event?: any) => {
    console.error(`Speech recognition error: ${error}`, event);
    
    // Don't show errors for aborted recognitions (normal operation)
    if (error === 'aborted') {
      return;
    }
    
    let errorMessage = t("speechRecognitionError");
    
    if (error === 'not-allowed') {
      errorMessage = t("microphoneAccessRequired");
    } else if (error === 'no-speech') {
      errorMessage = t("noSpeechDetected");
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
    
    // If we get any error besides 'aborted', try switching to the fallback
    switchToFallback();
  };

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
      
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting existing speech recognition:", e);
        }
      }
      
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.lang = languageRef.current;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;
      recognitionRef.current.maxAlternatives = 1;
      
      console.log(`Speech recognition initialized with language: ${languageRef.current}`);
      
      recognitionRef.current.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const latestTranscript = event.results[lastResultIndex][0].transcript;
        
        resetSilenceDetection();
        onTranscriptChange(latestTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        handleRecognitionError(event.error, event);
      };
      
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
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return false;
    }
  };

  // Media recording functions for fallback
  const startMediaRecording = async () => {
    try {
      console.log("Starting media recording with fallback method");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(currentChunks => [...currentChunks, event.data]);
        }
      };
      
      // Every 3 seconds, process the recording
      recorder.start(3000);
      resetSilenceDetection();
      
      console.log("Media recorder started successfully");
    } catch (error) {
      console.error("Error starting media recording:", error);
      setIsListening(false);
      
      const errorMessage = t("microphoneAccessRequired");
      if (onError) {
        onError(errorMessage);
      } else {
        toast({
          title: t("error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };
  
  const stopMediaRecording = () => {
    if (mediaRecorder && isRecording) {
      try {
        console.log("Stopping media recording");
        mediaRecorder.stop();
        setIsRecording(false);
      } catch (e) {
        console.error("Error stopping media recorder:", e);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Process audio chunks whenever they're updated
  useEffect(() => {
    if (audioChunks.length > 0 && isListening && useFallback) {
      processFallbackRecording();
    }
  }, [audioChunks]);
  
  const processFallbackRecording = async () => {
    if (audioChunks.length === 0) return;
    
    try {
      console.log(`Processing ${audioChunks.length} audio chunks with fallback method`);
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Audio = base64data.split(',')[1];
        
        // Reset chunks for next recording segment
        setAudioChunks([]);
        
        // Send to Supabase function
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { 
            audio: base64Audio,
            language: languageRef.current.split('-')[0] // Send just the language code (e.g., 'en' from 'en-US')
          }
        });
        
        if (error) {
          console.error("Error transcribing audio:", error);
          return;
        }
        
        if (data && data.text) {
          console.log("Received transcription:", data.text);
          onTranscriptChange(data.text);
          resetSilenceDetection();
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    if (onSilence) {
      silenceTimeoutRef.current = window.setTimeout(() => {
        if (isListening) {
          console.log(`${silenceTimeout/1000} seconds of silence detected, automatically sending message`);
          onSilence();
          
          if (!useFallback && recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch (e) {
              console.error("Error aborting speech recognition after silence:", e);
            }
          } else if (useFallback) {
            stopMediaRecording();
          }
          setIsListening(false);
        }
      }, silenceTimeout);
    }
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const startListening = () => {
    if (isListening) {
      console.log("Already listening, ignoring startListening call");
      return;
    }
    
    setIsListening(true);
    
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
    usingFallback: useFallback
  };
};
