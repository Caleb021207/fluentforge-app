
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { useTranslation } from "./useTranslation";
import { ChatMessage } from "./useChatMessages";

/**
 * Hook for handling API interactions for chat functionality
 */
export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  const { getTranslation } = useTranslation();

  /**
   * Send message to chat API and get response
   */
  const sendChatMessage = async (message: string, userLanguage: string): Promise<ChatMessage | null> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message,
          userLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Response from AI tutor:', data);
      
      // Ensure we always have a translation
      let translation = data.translation || "";
      
      // If no translation was provided, try to get one
      if (!translation) {
        translation = await getTranslation(data.content);
      }
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        translation: translation,
      };

      return assistantMessage;
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

  /**
   * Get a language learning prompt based on the current language
   */
  const getLanguageLearningPrompt = (language: string): string => {
    switch (language) {
      case "english":
        return "¡Hola! Quiero practicar español contigo.";
      case "spanish":
      case "portuguese":
      case "korean":
      case "arabic":
      case "mandarin":
      case "vietnamese":
      case "french":
        return "Hello! I want to practice English with you!";
      case "japanese":
        return "こんにちは！英語を練習したいと思います！";
      case "russian":
        return "Здравствуйте! Я хочу попрактиковаться в английском с вами!";
      default:
        return "Hello! I want to practice with you!";
    }
  };

  return {
    sendChatMessage,
    getLanguageLearningPrompt,
    isLoading,
    setIsLoading
  };
};
