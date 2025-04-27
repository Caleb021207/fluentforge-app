
import { useState, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { calculateRemainingWeeklyTime } from "@/utils/voiceChatUtils";

export const useVoiceChat = () => {
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 3;
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  const apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;

  const conversation = useConversation({
    apiKey,
    onMessage: (message) => {
      if (message.type === "llm_response") {
        console.log("LLM response received:", message.content);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConversationActive = () => conversation.status !== "disconnected";

  useEffect(() => {
    const initMicrophone = async () => {
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

    initMicrophone();
  }, [toast, t]);

  useEffect(() => {
    let timerId: number | null = null;
    
    if (isConversationActive() && voiceChatTimeRemaining !== null) {
      timerId = window.setInterval(() => {
        setVoiceChatTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            if (isConversationActive()) {
              endVoiceConversation();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit10MinReached"),
              });
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isConversationActive(), voiceChatTimeRemaining]);

  const startVoiceConversation = async () => {
    setConnectionAttempts(0);
    if (!microphoneAccess) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
      } catch (error) {
        console.error("Microphone access error on start:", error);
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
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive",
        });
        return;
      }
      
      // Track this as a voice API call
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: user.id,
          call_type: 'unlimited_voice'
        });

      const selectedAgentId = getAgentIdForLanguage(currentLanguage);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      const conversationId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      
      const remainingTime = await calculateRemainingWeeklyTime(user.id);
      setVoiceChatTimeRemaining(remainingTime);
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
      
    } catch (error) {
      console.error("Voice conversation error:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
    }
  };

  const endVoiceConversation = async () => {
    if (isConversationActive()) {
      await conversation.endSession();
      console.log("Ended conversation session");
      
      setVoiceChatTimeRemaining(null);
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
  };

  return {
    microphoneAccess,
    voiceChatTimeRemaining,
    isConversationActive,
    startVoiceConversation,
    endVoiceConversation,
    conversation,
    calculateRemainingWeeklyTime
  };
};
