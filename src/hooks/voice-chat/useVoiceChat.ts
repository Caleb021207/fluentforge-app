
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { useMicrophoneAccess } from "@/hooks/useMicrophoneAccess";
import { useVoiceChatSession } from "./useVoiceChatSession";
import { useVoiceChatApiKeys } from "./useVoiceChatApiKeys";
import { useVoiceChatConnection } from "./useVoiceChatConnection";
import { VoiceChatReturn } from "./types";

export const useVoiceChat = (): VoiceChatReturn => {
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  const { microphoneAccess, requestMicrophoneAccess } = useMicrophoneAccess();
  const [onMessageCallback, setOnMessageCallback] = useState<(message: any) => void>(() => () => {});
  
  const {
    currentSessionId,
    connectionAttempts,
    setConnectionAttempts,
    createConversationSession,
    endConversationSession
  } = useVoiceChatSession();
  
  const { getElevenLabsApiKey } = useVoiceChatApiKeys();
  
  const {
    isActive,
    isSpeaking,
    startConversation,
    endConversation
  } = useVoiceChatConnection();

  // Create a simpler interface for the conversation object
  const conversation = {
    status: isActive ? "connected" : "disconnected",
    isSpeaking,
    startSession: async (opts: any) => {
      console.log("Starting conversation session with:", opts);
      return `conversation-${Date.now()}`;
    },
    endSession: async () => {
      console.log("Ending conversation session");
      return true;
    }
  };

  const isConversationActive = () => isActive;

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
      
      // Fetch API key
      const apiKey = await getElevenLabsApiKey(currentLanguage);
      if (!apiKey) {
        console.warn("No API key available for ElevenLabs");
      }
      
      // Start the conversation
      const conversationId = await startConversation(currentLanguage);
      
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
        await endConversation();
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentSessionId) {
        await endConversationSession(user.id);
      }
      
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
  }, [isConversationActive, currentSessionId]);

  return {
    isActive,        
    isSpeaking,      
    microphoneAccess,
    isConversationActive,
    startVoiceConversation,
    endVoiceConversation,
    conversation,
    setMessageHandler
  };
};
