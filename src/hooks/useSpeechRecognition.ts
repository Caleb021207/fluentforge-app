
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getSpeechRecognitionErrorMessage } from "@/utils/speechRecognitionUtils";

interface UseSpeechRecognitionOptions {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  autoRestart?: boolean;
  audioDevice?: string; // Optional device ID for input
}

export const useSpeechRecognition = ({
  language,
  continuous = true,
  interimResults = true,
  onTranscript,
  onEnd,
  autoRestart = true,
  audioDevice
}: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  
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
    if (recognitionRef.current) {
      try {
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
          console.log("Current audio context:", document.defaultView?.audioContext || "No audio context found");
          
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
      };
      
      recognitionRef.current.onerror = (event: any) => {
        const errorCode = event.error;
        console.error("Speech recognition error:", errorCode);
        setError(errorCode);
        
        const errorMessage = getSpeechRecognitionErrorMessage(errorCode);
        
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
        
        // If we're still in listening mode, try to restart
        if (isListening && autoRestart) {
          console.log("Attempting to restart speech recognition after delay...");
          
          // Clear any existing timeout
          if (restartTimeoutRef.current !== null) {
            window.clearTimeout(restartTimeoutRef.current);
          }
          
          // Set a timeout to restart after a delay to avoid race conditions
          restartTimeoutRef.current = window.setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
                console.log("Restarted speech recognition after delay");
              } catch (err) {
                console.error("Failed to restart speech recognition:", err);
                setIsListening(false);
                setError("Failed to restart recognition");
                
                if (onEnd) {
                  onEnd();
                }
              }
            }
          }, 800); // Increased delay from 500ms to 800ms
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
  }, [isListening, isSupported, autoRestart, onTranscript, onEnd, toast, t]);
  
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
      // Explicitly request microphone access before starting
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
    
    // Clear any pending restart timeout when explicitly stopping
    if (restartTimeoutRef.current !== null) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
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
    availableDevices
  };
};
