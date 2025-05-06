
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getAgentIdForLanguage } from "@/utils/elevenLabsUtils";

export const useVoiceChatConnection = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const startConversation = async (language: string): Promise<string | null> => {
    try {
      const selectedAgentId = getAgentIdForLanguage(language);
      console.log(`Starting voice conversation with agent ID: ${selectedAgentId} for ${language} speaker`);
      
      setIsActive(true);
      const conversationId = `conversation-${Date.now()}-${language}`;
      
      toast({
        title: t("startVoiceChat"),
        description: t("startChatting"),
      });
      
      return conversationId;
    } catch (error) {
      console.error("Error starting voice conversation:", error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
      return null;
    }
  };
  
  const endConversation = async (): Promise<boolean> => {
    try {
      console.log("Ending conversation session");
      setIsActive(false);
      setIsSpeaking(false);
      
      toast({
        title: t("stopVoiceChat"),
        description: t("voiceChatEnded"),
      });
      
      return true;
    } catch (error) {
      console.error("Error ending conversation:", error);
      return false;
    }
  };
  
  return {
    isActive,
    isSpeaking,
    setIsSpeaking,
    startConversation,
    endConversation
  };
};
