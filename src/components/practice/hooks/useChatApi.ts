
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";

export const useChatApi = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  const sendMessage = async (input: string): Promise<ChatMessage | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: input,
          userLanguage: currentLanguage,
        },
      });

      if (error) throw error;

      if (!data) {
        throw new Error("No response from tutor");
      }

      return {
        role: "assistant",
        content: data.content,
        translation: data.translation
      };
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: t("error"),
        description: error.message || t("networkConnectionIssue"),
        variant: "destructive",
      });
      return null;
    }
  };

  return { sendMessage };
};
