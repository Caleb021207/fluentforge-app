
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { ChatMessage } from "@/types/chat";

export const useChatApi = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = async (message: string): Promise<ChatMessage | string> => {
    setIsProcessing(true);
    
    try {
      // Call to API endpoint
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message,
          userLanguage: localStorage.getItem("nativeLanguage") || "english",
          targetLanguage: localStorage.getItem("targetLanguage") || "spanish",
        }
      });

      if (error) {
        console.error('Error sending message to API:', error);
        toast({
          title: t("error") || "Error",
          description: t("failedToSendMessage") || "Failed to send message",
          variant: "destructive",
        });
        return t("errorSendingMessage") || "Error sending message. Please try again.";
      }

      // Return the response content
      return data?.content || data?.reply || data;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: t("error") || "Error",
        description: t("failedToSendMessage") || "Failed to send message",
        variant: "destructive",
      });
      return t("errorSendingMessage") || "Error sending message. Please try again.";
    } finally {
      setIsProcessing(false);
    }
  };

  return { sendMessage, isProcessing };
};
