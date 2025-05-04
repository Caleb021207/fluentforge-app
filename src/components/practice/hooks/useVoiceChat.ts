
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";

export const useVoiceChat = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Check if user is logged in
  const checkIsLoggedIn = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getUser();
    return !!data.user;
  };

  const conversation = {
    startSession: async () => {
      console.log("Starting voice conversation");
      setIsVoiceActive(true);
      return `voice-conversation-${Date.now()}`;
    },
    endSession: async () => {
      console.log("Ending voice conversation");
      setIsVoiceActive(false);
      return true;
    }
  };

  const startVoiceConversation = useCallback(async () => {
    const isLoggedIn = await checkIsLoggedIn();
    
    if (!isLoggedIn) {
      toast({
        title: t("loginRequired"),
        description: t("loginToStartVoiceChat"),
        variant: "destructive"
      });
      return;
    }
    
    try {
      await conversation.startSession();
      toast({
        title: t("voiceChatStarted"),
        description: t("beginSpeaking")
      });
    } catch (error: any) {
      console.error("Error starting voice chat:", error);
      toast({
        title: t("errorStartingVoiceChat"),
        description: error.message || t("unknownError"),
        variant: "destructive"
      });
    }
  }, [toast, t, conversation]);

  const endVoiceConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      toast({
        title: t("voiceChatEnded"),
        description: t("voiceChatSessionEnded")
      });
    } catch (error: any) {
      console.error("Error ending voice chat:", error);
      toast({
        title: t("errorEndingVoiceChat"),
        description: error.message || t("unknownError"),
        variant: "destructive"
      });
    }
  }, [toast, t, conversation]);

  const isConversationActive = useCallback(() => {
    return isVoiceActive;
  }, [isVoiceActive]);

  return {
    startVoiceConversation,
    endVoiceConversation,
    isConversationActive,
    conversation
  };
};
