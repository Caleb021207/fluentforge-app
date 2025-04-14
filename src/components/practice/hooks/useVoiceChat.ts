
import { useState, useRef } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { calculateRemainingWeeklyTime } from "@/utils/voiceChatUtils";
import { useMicrophoneAccess } from "@/hooks/voice-chat/useMicrophoneAccess";
import { useVoiceChatTimer } from "@/hooks/voice-chat/useVoiceChatTimer";
import { useVoiceChatMessages } from "@/hooks/voice-chat/useVoiceChatMessages";

export const useVoiceChat = () => {
  const [voiceChatTimeRemaining, setVoiceChatTimeRemaining] = useState<number | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 3;
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  const apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
  const { microphoneAccess, checkMicrophoneAccess } = useMicrophoneAccess(t);
  const { messages, clearMessages, addInitialMessage, addMessage } = useVoiceChatMessages();

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

  const { timerValue, formatTimer } = useVoiceChatTimer({
    isConversationActive,
    weeklyTimeRemaining: voiceChatTimeRemaining,
    onTimeExpired: () => {
      if (isConversationActive()) {
        endVoiceConversation();
      }
    },
    t
  });

  const tryStartConversation = async (sessionId: string) => {
    try {
      const selectedAgentId = getAgentIdForLanguage(currentLanguage);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker (attempt ${connectionAttempts + 1})`);
      
      if (isConversationActive()) {
        await conversation.endSession();
      }
      
      console.log(`Attempting to start session with agent ID: ${selectedAgentId}`);
      const conversationId = await conversation.startSession({
        agentId: selectedAgentId,
      });
      
      console.log(`Successfully started conversation session: ${conversationId}`);
      
      const remainingTime = await calculateRemainingWeeklyTime(sessionId);
      setVoiceChatTimeRemaining(remainingTime);
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
      
      return true;
    } catch (error) {
      console.error(`Connection attempt ${connectionAttempts + 1} failed:`, error);
      setConnectionAttempts(prev => prev + 1);
      
      if (connectionAttempts < maxConnectionAttempts - 1) {
        console.log(`Retrying connection (attempt ${connectionAttempts + 2} of ${maxConnectionAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return tryStartConversation(sessionId);
      } else {
        console.error(`Failed to connect after ${maxConnectionAttempts} attempts`);
        toast({
          title: t("error"),
          description: `${t("networkConnectionIssue")}. ${t("failedToCreateSession")}`,
          variant: "destructive",
        });
        
        try {
          await supabase
            .from('premium_voice_chat_sessions')
            .update({ session_end: new Date().toISOString() })
            .eq('id', sessionId);
        } catch (dbError) {
          console.error("Error updating session end time:", dbError);
        }
        
        return false;
      }
    }
  };

  const startVoiceConversation = async () => {
    setConnectionAttempts(0);
    const hasAccess = await checkMicrophoneAccess();
    if (!hasAccess) return;

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
      
      if (isConversationActive()) {
        endVoiceConversation();
        return;
      }
      
      const remainingTime = await calculateRemainingWeeklyTime(user.id);
      
      if (remainingTime <= 0) {
        toast({
          title: t("cooldownActive"),
          description: t("dailyLimitReached"),
          variant: "destructive",
        });
        return;
      }
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: user.id
        })
        .select()
        .single();
        
      if (sessionError) {
        console.error("Error creating session:", sessionError);
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "destructive",
        });
        return;
      }

      await tryStartConversation(sessionData.id);
      
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
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: activeSession, error: findError } = await supabase
            .from('premium_voice_chat_sessions')
            .select('id')
            .eq('user_id', user.id)
            .is('session_end', null)
            .order('session_start', { ascending: false })
            .limit(1)
            .single();
            
          if (!findError && activeSession) {
            await supabase
              .from('premium_voice_chat_sessions')
              .update({ session_end: new Date().toISOString() })
              .eq('id', activeSession.id);
          }
        }
      } catch (error) {
        console.error("Error updating session end time:", error);
      }
      
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
