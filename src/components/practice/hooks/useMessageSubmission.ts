
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "../types/chat";
import { useTranslations } from "./useTranslations";

export const useMessageSubmission = (
  currentLanguage: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const { processResponseWithTranslation } = useTranslations();

  const handleSendPrompt = async (promptText: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: promptText,
          userLanguage: currentLanguage,
          requestTranslation: true // Explicitly request translation
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Response with translation check:', data);
      
      const processedResponse = await processResponseWithTranslation(data, currentLanguage);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: processedResponse.content,
        translation: processedResponse.translation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Sự cố kết nối mạng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSendPrompt
  };
};
