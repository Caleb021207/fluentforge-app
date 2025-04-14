import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { initAzureSpeechToText, azureTextToSpeech, getAzureVoiceForLanguage, streamingAzureTTS } from "@/utils/azureSpeechUtils";
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
        if (interimTranscript.trim().split(" ").length > 2) {
          handleUserSpeech(interimTranscript);
        }
      }
    }, 1500);
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("loginRequired"),
          description: t("pleaseLoginToAccessProFeature"),
          variant: "destructive",
        });
        return;
      }

      conversationHistoryRef.current = [{
        role: "system", 
        content: `You are a language learning assistant for ${currentLanguage}. Help the user practice their language skills. 
                 Keep responses concise (max 2-3 sentences) and natural.`
      }];
      
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
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
          recognizerRef.current = null;
        } catch (e) {
          console.error("Error closing previous recognizer:", e);
        }
      }
      
      const speechRecognition = initAzureSpeechToText(currentLanguage);
      recognizerRef.current = speechRecognition;

      if (!speechRecognition) {
        throw new Error("Failed to initialize speech recognition. Azure Speech services may not be available.");
      }

      if (speechRecognition.recognizer) {
        speechRecognition.recognizer.recognizing = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
            setInterimTranscript(e.result.text);
            resetSilenceDetection();
          }
        };

        speechRecognition.recognizer.recognized = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
            const finalText = e.result.text;
            if (finalText.trim().length > 0) {
              if (finalText.trim().split(" ").length > 2 && !responsePendingRef.current) {
                setTranscript(finalText);
                handleUserSpeech(finalText);
              } else {
                setTranscript(prev => prev ? `${prev} ${finalText}` : finalText);
              }
            }
          }
        };

        speechRecognition.recognizer.canceled = (s, e) => {
          console.log("Speech recognition canceled:", e);
          if (isActive && e.reason !== sdk.CancellationReason.Error) {
            setTimeout(() => {
              startContinuousSpeechRecognition();
            }, 1000);
          }
        };

        speechRecognition.recognizer.sessionStopped = (s, e) => {
          console.log("Speech recognition stopped");
          if (isActive) {
            setTimeout(() => {
              startContinuousSpeechRecognition();
            }, 1000);
          }
        };

        await speechRecognition.recognizer.startContinuousRecognitionAsync();
        console.log("Continuous speech recognition started");
      } else {
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
      
      useBrowserSpeechRecognition();
    }
  };

  const useBrowserSpeechRecognition = () => {
    console.log("Browser speech recognition not implemented yet");
    toast({
      title: t("warning"),
      description: t("usingSpeechFallback"),
    });
  };

  const endSession = async () => {
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
      toast({
        title: t("proVoiceChatEnded"),
        description: t("youUsedMinutes", { minutes: formatTime(900 - sessionTimeRemaining) }),
      });
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleUserSpeech = async (transcribedText: string) => {
    if (responsePendingRef.current || !isActive) return;
    
    responsePendingRef.current = true;
    setStatus("processing");
    
    try {
      conversationHistoryRef.current.push({
        role: "user",
        content: transcribedText
      });
      
      setInterimTranscript("");
      
      const mockApiCall = async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const mockResponse = `This is a simulated response to: "${transcribedText}". 
                              I understand you're trying to practice ${currentLanguage}. 
                              How can I help you improve your language skills today?`;
        
        return mockResponse;
      };
      
      const aiResponse = await mockApiCall();
      setResponse(aiResponse);
      
      conversationHistoryRef.current.push({
        role: "assistant",
        content: aiResponse
      });
      
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
      const audioArrayBuffer = await azureTextToSpeech(responseText, currentLanguage);
      
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
  };
  
  const fallbackToSpeechSynthesis = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
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
