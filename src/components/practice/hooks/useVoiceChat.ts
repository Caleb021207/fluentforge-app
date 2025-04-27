
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
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

  // Cleanup effect to ensure sessions are ended on component unmount
  useEffect(() => {
    return () => {
      if (isConversationActive() && currentSessionId) {
        // Handle cleanup on unmount
        endVoiceConversation().catch(err => {
          console.error("Error cleaning up voice conversation on unmount:", err);
        });
      }
    };
  }, []);

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
      
      // Create premium voice session record first
      const { data: sessionData, error: sessionError } = await supabase
        .from('premium_voice_chat_sessions')
        .insert({
          user_id: user.id
        })
        .select('id')
        .single();
      
      if (sessionError) {
        console.error("Error creating session record:", sessionError);
        toast({
          title: t("error"),
          description: t("failedToCreateSession"),
          variant: "destructive",
        });
        return;
      }
      
      setCurrentSessionId(sessionData.id);
      
      // Track this as a premium voice API call
      await supabase
        .from('api_calls_tracking')
        .insert({
          user_id: user.id,
          call_type: 'premium_voice'  // Consistent naming: premium_voice instead of unlimited_voice
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
      
      return {
        conversationId,
        sessionId: sessionData.id
      };
      
    } catch (error) {
      console.error("Voice conversation error:", error);
      // If we created a session but failed to start the conversation, close the session
      if (currentSessionId) {
        try {
          await supabase
            .from('premium_voice_chat_sessions')
            .update({
              session_end: new Date().toISOString()
            })
            .eq('id', currentSessionId);
        } catch (closeErr) {
          console.error("Failed to close session after error:", closeErr);
        }
        setCurrentSessionId(null);
      }
      
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const endVoiceConversation = async () => {
    let endedSession = false;
    
    // First, try to end the ElevenLabs conversation
    if (isConversationActive()) {
      try {
        await conversation.endSession();
        console.log("Ended conversation session");
      } catch (error) {
        console.error("Error ending ElevenLabs session:", error);
        // Continue with cleanup even if ending the session fails
      }
    }
    
    // Next, update the database record if we have a session ID
    if (currentSessionId) {
      try {
        const { error } = await supabase
          .from('premium_voice_chat_sessions')
          .update({
            session_end: new Date().toISOString()
          })
          .eq('id', currentSessionId);
          
        if (error) {
          console.error("Error updating session end time:", error);
          throw error;
        }
        
        endedSession = true;
        setVoiceChatTimeRemaining(null);
        
        // Get the user ID for recalculating metrics
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            // Recalculate metrics after closing a session
            await supabase.rpc('recalculate_student_metrics', { target_student_id: user.id });
          } catch (recalcError) {
            console.error("Error recalculating metrics:", recalcError);
            // Don't throw error here, as the session was already closed
          }
        }
      } catch (error) {
        console.error("Error closing voice chat session:", error);
        // We'll still clear the state even if updating the DB fails
      } finally {
        setCurrentSessionId(null);
      }
    }
    
    if (endedSession) {
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
    }
    
    return endedSession;
  };

  return {
    microphoneAccess,
    voiceChatTimeRemaining,
    currentSessionId,
    isConversationActive,
    startVoiceConversation,
    endVoiceConversation,
    conversation,
    calculateRemainingWeeklyTime
  };
};
