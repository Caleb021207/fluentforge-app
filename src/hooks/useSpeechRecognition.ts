
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getSpeechRecognitionErrorMessage } from "@/utils/speechRecognitionUtils";
import { debounce } from "lodash";

interface UseSpeechRecognitionOptions {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  autoRestart?: boolean;
  audioDevice?: string; // Optional device ID for input
  silenceTimeout?: number; // Time in ms to wait before considering silence
  disableAutoStop?: boolean; // New option to disable auto-stopping
}

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
}: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [isRestarting, setIsRestarting] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const hasTranscriptRef = useRef<boolean>(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Debounced transcript handler to prevent rapid updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTranscriptHandler = useCallback(
    debounce((text: string, isFinal: boolean) => {
      if (onTranscript) {
        onTranscript(text, isFinal);
      }
      
      // Reset silence detection when we get new transcript
      if (!disableAutoStop) {
        resetSilenceDetection(text);
      }
    }, 300),
    [onTranscript, disableAutoStop]
  );
  
  // Check available audio devices
  useEffect(() => {
    const checkDevices = async () => {
      try {
        // First request permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get all audio input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        
        console.log("Available audio input devices:", audioInputDevices);
        setAvailableDevices(audioInputDevices);
        
        // Release the stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Error checking audio devices:", err);
      }
    };
    
    checkDevices();
    
    // Setup device change listener
    navigator.mediaDevices.addEventListener('devicechange', checkDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkDevices);
    };
  }, []);
  
  // Reset silence detection timer
  const resetSilenceDetection = useCallback((text?: string) => {
    // If auto-stopping is disabled, don't set up silence detection
    if (disableAutoStop) {
      return;
    }
    
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    // Only set up silence detection if we're listening and have a silence timeout
    if (isListening && silenceTimeout && silenceTimeout > 0) {
      console.log("Setting up silence detection timeout for", silenceTimeout, "ms");
      
      // If we have text, update the hasTranscriptRef state
      if (text && text.trim() !== "") {
        hasTranscriptRef.current = true;
      }
      
      silenceTimeoutRef.current = window.setTimeout(() => {
        console.log("Silence timeout reached after", silenceTimeout, "ms");
        
        // Only auto-submit if we actually have a transcript
        if (hasTranscriptRef.current) {
          console.log("We have a transcript, calling onEnd");
          if (onEnd) {
            onEnd();
          }
          setIsListening(false);
        } else {
          console.log("No transcript detected, continuing to listen");
          // If no speech detected, just reset the timeout and continue listening
          resetSilenceDetection();
        }
      }, silenceTimeout);
    }
  }, [isListening, silenceTimeout, onEnd, disableAutoStop]);
  
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
    console.log("Cleaning up speech recognition");
    
    // Clear any silence detection timeout
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
      console.log("Cleared silence detection timeout");
    }
    
    if (recognitionRef.current) {
      try {
        // Remove event listeners first
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
        console.log("Successfully aborted speech recognition");
      } catch (err) {
        console.error("Error cleaning up speech recognition:", err);
      }
    }
    
    // Clear any pending restart timeout
    if (restartTimeoutRef.current !== null) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
      console.log("Cleared pending restart timeout");
    }
    
    // Reset the restarting flag
    setIsRestarting(false);
    
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
          
          // Additional debugging for Mac devices
          if (navigator.userAgent.includes("Mac")) {
            console.log("Mac device detected, checking audio routing...");
          }
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
        console.error("Speech recognition error:", errorCode);
        setError(errorCode);
        
        const errorMessage = getSpeechRecognitionErrorMessage(errorCode);
        
        // Don't show errors for no-speech as they're common and annoying
        if (errorCode !== 'no-speech') {
          toast({
            title: t("speechRecognitionError"),
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        // Don't automatically restart on certain errors
        if (['not-allowed', 'service-not-allowed', 'permission-denied'].includes(errorCode)) {
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
        resetSilenceDetection();
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
  }, [isListening, isSupported, autoRestart, debouncedTranscriptHandler, onEnd, toast, t, resetSilenceDetection, isRestarting, disableAutoStop]);
  
  // Function to request microphone access explicitly
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
