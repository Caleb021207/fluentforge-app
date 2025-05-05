
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { logDataAccess } from "@/utils/contentSafetyUtils";
import { ChatResponse } from "./types";

export const useChatService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const sendChatRequest = async (
    message: string, 
    userLanguage: string, 
    targetLanguage: string
  ): Promise<ChatResponse | null> => {
    if (!message || message.trim() === "") {
      toast({
        title: t("error"),
        description: t("emptyMessage"),
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      console.log('Sending message to AI tutor:', { 
        message, 
        userLanguage, 
        targetLanguage, 
        requestTranslation: true 
      });
      
      // Use chat-with-tutor endpoint
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: message,
          userLanguage: userLanguage,
          targetLanguage: targetLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        console.error('Supabase invoke error:', error);
        throw error;
      }

      if (userLanguage === 'tagalog') {
        console.log('Response from AI tutor for Tagalog:', {
          hasData: !!data,
          hasTranslation: data && 'translation' in data,
          translationType: data?.translation ? typeof data.translation : 'none'
        });
      } else {
        console.log('Response from AI tutor:', data);
      }
      
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
      
      return {
        content: data.content,
        translation: data.translation
      };
      
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    setIsLoading,
    sendChatRequest
  };
};
