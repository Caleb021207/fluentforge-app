
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";
import { handleConnectionError } from "@/utils/authErrorHandler";

export const useChatApi = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  const sendMessage = async (input: string): Promise<ChatMessage | null> => {
    if (!input.trim()) {
      return null;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: input,
          userLanguage: currentLanguage,
        },
      });

      if (error) {
        // Try to handle connection errors by refreshing the session
        const reconnected = await handleConnectionError();
        if (!reconnected) {
          throw error;
        }
        
        // Retry after reconnection
        const retryResponse = await supabase.functions.invoke('chat-with-tutor', {
          body: {
            message: input,
            userLanguage: currentLanguage,
          },
        });
        
        if (retryResponse.error) {
          throw retryResponse.error;
        }
        
        return {
          role: "assistant",
          content: retryResponse.data.content,
          translation: retryResponse.data.translation
        };
      }

      if (!data || !data.content) {
        throw new Error("Invalid response from tutor");
      }

      return {
        role: "assistant",
        content: data.content,
        translation: data.translation
      };
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: t("error") || "Error",
        description: error.message || t("networkConnectionIssue") || "Network connection issue. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { sendMessage };
};
