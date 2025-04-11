
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { logDataAccess } from "@/utils/contentSafetyUtils";
import { useTranslationHandler } from "./useTranslationHandler";

export const useChatMessaging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { getTranslation, verifyHindiTranslation } = useTranslationHandler();

  const sendChatMessage = async (message: string) => {
    setIsLoading(true);

    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: message,
          userLanguage: currentLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        throw error;
      }

      console.log('Response from AI tutor:', data);
      
      let translation = data.translation || "";
      
      // Handle special translation cases
      translation = await verifyHindiTranslation(translation, data.content, currentLanguage);
      
      if (!translation && currentLanguage !== "english") {
        console.warn("Missing translation for", currentLanguage, "user");
        translation = await getTranslation(data.content, currentLanguage);
      }
      
      return {
        content: data.content,
        translation
      };
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t("error"),
        description: t("networkConnectionIssue"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    sendChatMessage
  };
};
