
import { useState, useEffect, useRef } from "react";
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
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

      // Start the Azure speech recognition
      const speechRecognition = initAzureSpeechToText(currentLanguage);
      
      try {
        await speechRecognition.startRecognition();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        toast({
          title: t("error"),
          description: t("speechRecognitionError"),
          variant: "destructive",
        });
        return;
      }

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

  const endSession = async () => {
    // Stop Azure speech recognition
    // This would be implemented with actual Azure SDK code
    
    setIsActive(false);
    setStatus("idle");

    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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
    setTranscript(transcribedText);
    setStatus("processing");
    
    try {
      // In a real implementation, this would send the text to an API
      // for processing and get a response from the language model
      // For now, we'll mock the response
      
      const mockResponse = `This is a simulated response to: "${transcribedText}"`;
      setResponse(mockResponse);
      
      // Convert the response to speech using Azure TTS
      try {
        const audioArrayBuffer = await azureTextToSpeech(mockResponse, currentLanguage);
        
        // Convert ArrayBuffer to Blob before creating a URL
        const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/wav' });
        
        // Play the audio
        if (audioRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          
          setStatus("speaking");
          
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setStatus("listening");
          };
        }
      } catch (error) {
        console.error("Error with text-to-speech:", error);
        // Fallback to browser's built-in speech synthesis
        const utterance = new SpeechSynthesisUtterance(mockResponse);
        window.speechSynthesis.speak(utterance);
        setStatus("speaking");
        
        utterance.onend = () => {
          setStatus("listening");
        };
      }
    } catch (error) {
      console.error("Error processing speech:", error);
      toast({
        title: t("error"),
        description: t("failedToProcessSpeech"),
        variant: "destructive",
      });
      setStatus("listening");
    }
  };

  return {
    status,
    microphoneAccess,
    transcript,
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
