import { useEffect, useState } from "react";
import { useConversation } from '@11labs/react';
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

  const maxConnectionAttempts = 3;

  // Initialize the conversation with appropriate configs
  const conversation = useConversation({
    apiKey: "", // We'll set this dynamically at runtime
    onMessage: (message) => {
      if (message.type === "llm_response") {
        console.log("LLM response received");
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

  const startVoiceConversation = async () => {
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
      
      // Securely fetch the API key
      const apiKey = await fetchApiKey(currentLanguage);
      if (!apiKey) {
        throw new Error("Failed to retrieve API key");
      }
      
      // Instead of trying to modify the conversation object directly,
      // we'll create a new conversation instance with the API key
      // and use that for the session
      
      const selectedAgentId = getAgentIdForLanguage(currentLanguage);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${currentLanguage} speaker`);
      
      // Start the session with the agent ID
      const conversationId = await conversation.startSession({
        agentId: selectedAgentId,
        apiKey: apiKey, // Pass the API key as part of the startSession options
      });
      
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
        await conversation.endSession();
        console.log("Ended conversation session");
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
