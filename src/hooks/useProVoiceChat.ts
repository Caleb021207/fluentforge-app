
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { initAzureSpeechToText, azureTextToSpeech, getAzureVoiceForLanguage } from "@/utils/azureSpeechUtils";
import { formatTime } from "@/utils/timeUtils";

type ProVoiceChatStatus = "idle" | "listening" | "processing" | "speaking";

export const useProVoiceChat = () => {
  const [status, setStatus] = useState<ProVoiceChatStatus>("idle");
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(900); // 15 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isProcessingPartial, setIsProcessingPartial] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognizerRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const responsePendingRef = useRef(false);
  const conversationHistoryRef = useRef<Array<{role: string, content: string}>>([]);
  
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  // Check microphone access on mount
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAccess(false);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      }
    };

    checkMicrophoneAccess();
  }, [toast, t]);

  // Handle timer when session is active
  useEffect(() => {
    if (isActive && sessionTimeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, sessionTimeRemaining]);

  // Clean up speech recognition resources on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
        } catch (e) {
          console.error("Error closing speech recognizer:", e);
        }
      }
      clearSilenceDetection();
    };
  }, []);

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    silenceTimeoutRef.current = window.setTimeout(() => {
      if (interimTranscript && isActive && !responsePendingRef.current) {
        console.log("Silence detected, processing interim transcript:", interimTranscript);
        // Process the current interim transcript if it's substantial
        if (interimTranscript.trim().split(" ").length > 2) {
          handleUserSpeech(interimTranscript);
        }
      }
    }, 1500); // 1.5 seconds of silence triggers processing
  };

  // Create session in database and start the conversation
  const startSession = async () => {
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("loginRequired"),
          description: t("pleaseLoginToAccessProFeature"),
          variant: "destructive",
        });
        return;
      }

      // Here we would create a session in the database
      // This is where we would check if the user has used their weekly time

      // Initialize conversation history
      conversationHistoryRef.current = [{
        role: "system", 
        content: `You are a language learning assistant for ${currentLanguage}. Help the user practice their language skills. 
                 Keep responses concise (max 2-3 sentences) and natural.`
      }];
      
      // Start the continuous speech recognition
      await startContinuousSpeechRecognition();
      
      setIsActive(true);
      setStatus("listening");
      
      toast({
        title: t("proVoiceChatStarted"),
        description: t("startSpeakingNow"),
      });
    } catch (error) {
      console.error("Failed to start Pro Voice session:", error);
      toast({
        title: t("error"),
        description: t("failedToStartSession"),
        variant: "destructive",
      });
    }
  };

  const startContinuousSpeechRecognition = async () => {
    try {
      // Clean up any existing recognizer
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
          recognizerRef.current = null;
        } catch (e) {
          console.error("Error closing previous recognizer:", e);
        }
      }
      
      // Initialize the speech recognizer with the current language
      const speechRecognition = initAzureSpeechToText(currentLanguage);
      recognizerRef.current = speechRecognition;

      if (!speechRecognition) {
        throw new Error("Failed to initialize speech recognition. Azure Speech services may not be available.");
      }

      // Set up event handlers for continuous recognition
      if (speechRecognition.recognizer) {
        speechRecognition.recognizer.recognizing = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
            // This is fired repeatedly as the user speaks
            setInterimTranscript(e.result.text);
            resetSilenceDetection();
          }
        };

        speechRecognition.recognizer.recognized = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
            const finalText = e.result.text;
            if (finalText.trim().length > 0) {
              // Only process if we have substantial content and not already processing
              if (finalText.trim().split(" ").length > 2 && !responsePendingRef.current) {
                setTranscript(finalText);
                handleUserSpeech(finalText);
              } else {
                // Update the transcript but don't process yet
                setTranscript(prev => prev ? `${prev} ${finalText}` : finalText);
              }
            }
          }
        };

        speechRecognition.recognizer.canceled = (s, e) => {
          console.log("Speech recognition canceled:", e);
          // Handle cancellation and restart if needed
          if (isActive && e.reason !== sdk.CancellationReason.Error) {
            setTimeout(() => {
              startContinuousSpeechRecognition();
            }, 1000);
          }
        };

        speechRecognition.recognizer.sessionStopped = (s, e) => {
          console.log("Speech recognition stopped");
          // Try to restart if still active
          if (isActive) {
            setTimeout(() => {
              startContinuousSpeechRecognition();
            }, 1000);
          }
        };

        // Start continuous recognition
        await speechRecognition.recognizer.startContinuousRecognitionAsync();
        console.log("Continuous speech recognition started");
      } else {
        // Fallback to browser's speech recognition if Azure fails
        console.warn("Using browser fallback for speech recognition");
        useBrowserSpeechRecognition();
      }
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      toast({
        title: t("error"),
        description: t("speechRecognitionError"),
        variant: "destructive",
      });
      
      // Try browser fallback
      useBrowserSpeechRecognition();
    }
  };

  const useBrowserSpeechRecognition = () => {
    // Placeholder for browser Speech Recognition API implementation
    // This would be implemented if needed as a fallback
    console.log("Browser speech recognition not implemented yet");
    toast({
      title: t("warning"),
      description: t("usingSpeechFallback"),
    });
  };

  const endSession = async () => {
    // Stop speech recognition
    if (recognizerRef.current && recognizerRef.current.recognizer) {
      try {
        await recognizerRef.current.recognizer.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
        recognizerRef.current = null;
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
    
    setIsActive(false);
    setStatus("idle");
    setInterimTranscript("");
    setTranscript("");
    setResponse("");

    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    clearSilenceDetection();

    try {
      // Update session end time in database
      // This is a placeholder for the actual implementation
      
      toast({
        title: t("proVoiceChatEnded"),
        description: t("youUsedMinutes", { minutes: formatTime(900 - sessionTimeRemaining) }),
      });
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleUserSpeech = async (transcribedText: string) => {
    // Prevent multiple calls while processing
    if (responsePendingRef.current || !isActive) return;
    
    responsePendingRef.current = true;
    setStatus("processing");
    
    try {
      // Add user message to conversation history
      conversationHistoryRef.current.push({
        role: "user",
        content: transcribedText
      });
      
      // Clear interim transcript since we're processing it
      setInterimTranscript("");
      
      // In a real implementation, this would send the conversation history to an API
      // for processing and get a response from the language model
      
      // Mock API call with a simulated delay
      const mockApiCall = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate a mock response based on the transcript
        const mockResponse = `This is a simulated response to: "${transcribedText}". 
                              I understand you're trying to practice ${currentLanguage}. 
                              How can I help you improve your language skills today?`;
        
        return mockResponse;
      };
      
      const aiResponse = await mockApiCall();
      setResponse(aiResponse);
      
      // Add AI response to conversation history
      conversationHistoryRef.current.push({
        role: "assistant",
        content: aiResponse
      });
      
      // Convert the response to speech using Azure TTS
      await speakResponse(aiResponse);
      
    } catch (error) {
      console.error("Error processing speech:", error);
      toast({
        title: t("error"),
        description: t("failedToProcessSpeech"),
        variant: "destructive",
      });
      setStatus("listening");
      responsePendingRef.current = false;
    }
  };

  const speakResponse = async (responseText: string) => {
    setStatus("speaking");
    
    try {
      // Try with Azure TTS first
      try {
        const audioArrayBuffer = await azureTextToSpeech(responseText, currentLanguage);
        
        // Convert ArrayBuffer to Blob and play
        const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        audioRef.current.src = audioUrl;
        audioRef.current.onplay = () => {
          console.log("Started playing audio response");
        };
        
        audioRef.current.onended = () => {
          console.log("Finished playing audio response");
          URL.revokeObjectURL(audioUrl);
          setStatus("listening");
          responsePendingRef.current = false;
        };
        
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e);
          fallbackToSpeechSynthesis(responseText);
        };
        
        await audioRef.current.play();
        
      } catch (error) {
        console.error("Error with Azure text-to-speech:", error);
        fallbackToSpeechSynthesis(responseText);
      }
    } catch (error) {
      console.error("All TTS methods failed:", error);
      setStatus("listening");
      responsePendingRef.current = false;
    }
  };
  
  const fallbackToSpeechSynthesis = (text: string) => {
    // Browser's built-in speech synthesis as fallback
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to set an appropriate voice based on language
    const voices = window.speechSynthesis.getVoices();
    const languageCode = currentLanguage.slice(0, 2).toLowerCase();
    const voice = voices.find(v => v.lang.includes(languageCode));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onend = () => {
      setStatus("listening");
      responsePendingRef.current = false;
    };
    
    utterance.onerror = () => {
      console.error("Speech synthesis error");
      setStatus("listening");
      responsePendingRef.current = false;
    };
    
    window.speechSynthesis.speak(utterance);
  };

  return {
    status,
    microphoneAccess,
    transcript,
    interimTranscript,
    response,
    isActive,
    sessionTimeRemaining,
    formatTime,
    startSession,
    endSession,
    handleUserSpeech,
    audioRef,
  };
};
