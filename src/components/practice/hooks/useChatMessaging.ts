
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { logDataAccess } from "@/utils/contentSafetyUtils";
import { useTranslationHandler } from "./useTranslationHandler";

export const useChatMessaging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { getTranslation, verifyHindiTranslation } = useTranslationHandler();

  const sendChatMessage = async (message: string) => {
    if (!message || message.trim() === "") {
      toast({
        title: t("error"),
        description: t("emptyMessage"),
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    setHasError(false);

    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      // Get the targetLanguage from localStorage 
      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      
      console.log('Sending message to AI tutor:', { 
        message, 
        userLanguage: currentLanguage, 
        targetLanguage, 
        requestTranslation: true 
      });
      
      // Use chat-with-gpt endpoint
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: message,
          userLanguage: currentLanguage,
          targetLanguage: targetLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        console.error('Supabase invoke error:', error);
        throw error;
      }

      console.log('Response from AI tutor:', data);
      
      // Handle case where response is missing content
      if (!data) {
        console.error('Empty response from AI tutor');
        throw new Error("Empty response from AI tutor");
      }
      
      if (data.error) {
        console.error('Error from AI tutor:', data.error);
        throw new Error(data.error);
      }
      
      if (!data.content) {
        console.error('Invalid response from AI tutor - missing content:', data);
        throw new Error("Response from AI tutor is missing content");
      }
      
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
      setHasError(true);
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

  const retryLastMessage = async (message: string) => {
    if (hasError) {
      setHasError(false);
      return await sendChatMessage(message);
    }
    return null;
  };

  return {
    isLoading,
    hasError,
    setIsLoading,
    sendChatMessage,
    retryLastMessage
  };
};
