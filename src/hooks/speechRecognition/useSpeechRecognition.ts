
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { debounce } from "lodash";
import { UseSpeechRecognitionOptions, UseSpeechRecognitionReturn } from "./types";
import { cleanupSpeechRecognition, handleSpeechRecognitionError, requestMicAccess } from "./utils";
import { useSilenceDetection } from "./useSilenceDetection";
import { useAudioDevices } from "./useAudioDevices";

export const useSpeechRecognition = ({
  language,
  continuous = true,
  interimResults = true,
  onTranscript,
  onEnd,
  autoRestart = true,
  audioDevice,
  silenceTimeout = 30000, // Default to 30 seconds, up from previous implicit 10s
  disableAutoStop = true  // Default to disabling auto-stop
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  
  const { availableDevices } = useAudioDevices();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const hasTranscriptRef = useRef<boolean>(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const { resetSilenceDetection } = useSilenceDetection({
    isListening, 
    silenceTimeout,
    onEnd,
    disableAutoStop
  });
  
  // Debounced transcript handler to prevent rapid updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTranscriptHandler = useCallback(
    debounce((text: string, isFinal: boolean) => {
      if (onTranscript) {
        onTranscript(text, isFinal);
      }
      
      // Reset silence detection when we get new transcript
      if (!disableAutoStop) {
        resetSilenceDetection(silenceTimeoutRef, hasTranscriptRef, text);
      }
    }, 300),
    [onTranscript, disableAutoStop, resetSilenceDetection]
  );
  
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
  
  // Cleanup function to properly dispose of speech recognition
  const cleanupRecognition = useCallback(() => {
    cleanupSpeechRecognition(
      recognitionRef,
      silenceTimeoutRef,
      restartTimeoutRef,
      setIsRestarting
    );
    
    // Reset transcript reference
    hasTranscriptRef.current = false;
  }, []);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;
    
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        // Cleanup previous instance if it exists
        cleanupRecognition();
        
        // Create new instance
        recognitionRef.current = new SpeechRecognitionAPI();
        
        if (recognitionRef.current) {
          recognitionRef.current.lang = language;
          recognitionRef.current.continuous = continuous;
          recognitionRef.current.interimResults = interimResults;
          recognitionRef.current.maxAlternatives = 1;
          
          // Log device info for debugging
          console.log(`Speech recognition initialized with language: ${language}`);
          console.log("Current audio context:", typeof window.AudioContext !== 'undefined' ? "Available" : "Not available");
        }
      }
    } catch (err) {
      console.error("Error initializing speech recognition:", err);
      setError("Failed to initialize speech recognition");
      setIsSupported(false);
    }
    
    // Cleanup function
    return cleanupRecognition;
  }, [isSupported, language, continuous, interimResults, cleanupRecognition, audioDevice]);
  
  // Set up event handlers when listening state changes
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    if (isListening && !isRestarting) {
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const transcriptText = event.results[lastResultIndex][0].transcript;
        const isFinal = event.results[lastResultIndex].isFinal;
        
        setTranscript(transcriptText);
        console.log(`Speech recognized: "${transcriptText}" (isFinal: ${isFinal})`);
        
        // Use debounced handler to prevent too many updates
        debouncedTranscriptHandler(transcriptText, isFinal);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        const errorCode = event.error;
        const shouldStopRestarting = handleSpeechRecognitionError(errorCode, setError, toast, t);
        
        // Don't automatically restart on certain errors
        if (shouldStopRestarting) {
          console.log("Not restarting due to permission error:", errorCode);
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        
        // If we're still in listening mode and not already restarting, try to restart
        if (isListening && autoRestart && !isRestarting) {
          console.log("Attempting to restart speech recognition after delay...");
          
          // Mark as restarting to prevent multiple restarts
          setIsRestarting(true);
          
          // Clear any existing timeout
          if (restartTimeoutRef.current !== null) {
            window.clearTimeout(restartTimeoutRef.current);
          }
          
          // Set a timeout to restart after a delay to avoid race conditions
          // Increased from 800ms to 1500ms to give more time for cleanup
          restartTimeoutRef.current = window.setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
                console.log("Restarted speech recognition after delay");
                setIsRestarting(false);
              } catch (err) {
                console.error("Failed to restart speech recognition:", err);
                setIsListening(false);
                setIsRestarting(false);
                setError("Failed to restart recognition");
                
                if (onEnd) {
                  onEnd();
                }
              }
            } else {
              setIsRestarting(false);
            }
          }, 1500); // Increased delay from 800ms to 1500ms
        } else {
          setIsListening(false);
          
          if (onEnd) {
            onEnd();
          }
        }
      };
      
      // Only set up silence detection if auto-stop is not disabled
      if (!disableAutoStop) {
        resetSilenceDetection(silenceTimeoutRef, hasTranscriptRef);
      }
      
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
    } else if (recognitionRef.current && !isRestarting) {
      // Make sure we stop listening if the state is set to false
      try {
        console.log("Stopping speech recognition");
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
        
        // Try to abort as a backup plan
        try {
          console.log("Attempting to abort speech recognition");
          recognitionRef.current.abort();
        } catch (abortErr) {
          console.error("Error aborting speech recognition:", abortErr);
        }
      }
    }
  }, [isListening, isSupported, autoRestart, debouncedTranscriptHandler, onEnd, toast, t, isRestarting, disableAutoStop, resetSilenceDetection]);
  
  // Function to request microphone access explicitly
  const requestMicrophoneAccess = useCallback(async () => {
    return requestMicAccess(setError, toast, t);
  }, [toast, t]);
  
  const startListening = async () => {
    if (isSupported) {
      console.log("Starting speech recognition");
      
      // If we're already listening or restarting, don't try to start again
      if (isListening || isRestarting) {
        console.log("Already listening or in process of restarting, not starting again");
        return;
      }
      
      // Explicitly request microphone access before starting
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) return;
      
      // Clean up any existing recognition instance
      cleanupRecognition();
      
      setError(null);
      setTranscript("");
      setIsListening(true);
      hasTranscriptRef.current = false;
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
    
    // Reset transcript reference
    hasTranscriptRef.current = false;
    
    // Clear any silence detection timeout
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    // Clear any pending restart timeout when explicitly stopping
    if (restartTimeoutRef.current !== null) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    // Clean up recognition
    cleanupRecognition();
  };
  
  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
    isSupported,
    requestMicrophoneAccess,
    availableDevices
  };
};
