
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { useConversationState } from "@/hooks/useConversationState";
import { useMicrophoneAccess } from "@/hooks/useMicrophoneAccess";
import { calculateRemainingWeeklyTime } from "@/utils/voiceChatUtils";
import { useSecureApiKeys } from "@/hooks/useSecureApiKeys";

export const useVoiceChat = () => {
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { microphoneAccess, requestMicrophoneAccess } = useMicrophoneAccess();
  const [onMessageCallback, setOnMessageCallback] = useState<(message: any) => void>(() => () => {});
  const { fetchApiKey } = useSecureApiKeys();
  const {
    currentSessionId,
    connectionAttempts,
    setConnectionAttempts,
    createConversationSession,
    endConversationSession
  } = useConversationState();

  const [isActive, setIsActive] = useState(false);
  
  // Placeholder for ElevenLabs conversation
  const conversation = {
    status: isActive ? "connected" : "disconnected",
    isSpeaking: false,
    startSession: async (opts: any) => {
      console.log("[PLACEHOLDER] Would start conversation session with:", opts);
      return `placeholder-conversation-${Date.now()}`;
    },
    endSession: async () => {
      console.log("[PLACEHOLDER] Would end conversation session");
      return true;
    }
  };

  const isConversationActive = () => isActive;

  const startVoiceConversation = async (overrideLanguage?: string) => {
    setConnectionAttempts(0);
    
    if (!microphoneAccess) {
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) {
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
        return { conversationId: null };
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
        return { conversationId: null };
      }

      await createConversationSession(user.id);
      
      // Placeholder for API key fetch
      console.log("[PLACEHOLDER] Would fetch API key for", overrideLanguage || currentLanguage);
      
      // Placeholder for agent ID, using override language if provided
      const selectedAgentId = getAgentIdForLanguage(overrideLanguage || currentLanguage);
      console.log(`[PLACEHOLDER] Would start voice conversation with agent ID: ${selectedAgentId} for ${overrideLanguage || currentLanguage} speaker`);
      
      // Simulate session start
      setIsActive(true);
      const conversationId = `placeholder-conversation-${Date.now()}`;
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
      
      return { conversationId };
      
    } catch (error) {
      console.error("Voice conversation error:", error);
      if (currentSessionId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await endConversationSession(user.id);
          }
        } catch (closeErr) {
          console.error("Failed to close session after error:", closeErr);
        }
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
    try {
      if (isConversationActive()) {
        console.log("[PLACEHOLDER] Would end conversation session");
        setIsActive(false);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentSessionId) {
        await endConversationSession(user.id);
      }
      
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
      
      return true;
    } catch (error) {
      console.error("Error ending voice conversation:", error);
      return false;
    }
  };

  // Method to set a custom message handler
  const setMessageHandler = (handler: (message: any) => void) => {
    setOnMessageCallback(() => handler);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (isConversationActive() && currentSessionId) {
        endVoiceConversation().catch(err => {
          console.error("Error cleaning up voice conversation on unmount:", err);
        });
      }
    };
  }, []);

  return {
    microphoneAccess,
    isConversationActive,
    startVoiceConversation,
    endVoiceConversation,
    conversation
  };
};
