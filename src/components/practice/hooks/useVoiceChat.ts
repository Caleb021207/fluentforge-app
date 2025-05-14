
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useElevenLabsAgent, getAgentIdForLanguage } from "@/utils/elevenLabsUtils";
import { useConversationState } from "@/hooks/useConversationState";
import { useMicrophoneAccess } from "@/hooks/useMicrophoneAccess";
import { calculateRemainingWeeklyTime } from "@/utils/voiceChatUtils";
import { useSecureApiKeys } from "@/hooks/useSecureApiKeys";

export const useVoiceChat = () => {
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { microphoneAccess, requestMicrophoneAccess } = useMicrophoneAccess();
  const [onMessageCallback, setOnMessageCallback] = useState<(message: any) => void>(() => () => {});
  const { fetchApiKey, elevenLabsApiKey } = useSecureApiKeys();
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  
  const {
    currentSessionId,
    connectionAttempts,
    setConnectionAttempts,
    createConversationSession,
    endConversationSession
  } = useConversationState();

  // Language that will be used for the conversation
  const [activeLanguage, setActiveLanguage] = useState<string>(currentLanguage);
  
  // Use the mock ElevenLabs hook - this actually uses OpenAI Chat GPT Nano and Azure TTS
  const {
    startAgent,
    stopAgent,
    isConnected,
    isSpeaking,
    conversation
  } = useElevenLabsAgent(activeLanguage);

  // Function to check if conversation is active
  const isConversationActive = () => isConnected;

  // Effect to fetch API key on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await fetchApiKey(activeLanguage);
        setApiKeyLoaded(!!key);
      } catch (error) {
        console.error("Failed to load API key:", error);
        setApiKeyLoaded(false);
      }
    };
    
    loadApiKey();
  }, [activeLanguage]);

  const startVoiceConversation = async (overrideLanguage?: string) => {
    setConnectionAttempts(prev => prev + 1);
    
    // Set the active language
    if (overrideLanguage) {
      setActiveLanguage(overrideLanguage);
    }
    
    // Check for microphone access
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive",
        });
        return { conversationId: null };
      }

      // Create a conversation session in our database
      await createConversationSession(user.id);
      
      // Fetch API key if not already loaded
      if (!elevenLabsApiKey && !apiKeyLoaded) {
        const key = await fetchApiKey(overrideLanguage || currentLanguage);
        if (!key) {
          throw new Error("Failed to fetch API key");
        }
        setApiKeyLoaded(true);
      }
      
      // Start the conversation agent (uses OpenAI + Azure TTS behind the scenes)
      const conversationId = await startAgent(elevenLabsApiKey || "");
      
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
        await stopAgent();
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
    conversation,
    setMessageHandler,
    apiKeyLoaded
  };
};
