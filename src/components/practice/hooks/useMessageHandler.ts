
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";

export const useMessageHandler = (setMessageCount: (prev: { inputs: number; outputs: number; }) => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  const handleMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      setMessageCount(prev => ({
        ...prev,
        inputs: prev.inputs + 1
      }));

      const userMessage = {
        role: "user" as const,
        content: input,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

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

      const assistantMessage = {
        role: "assistant" as const,
        content: data.content,
        translation: data.translation
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setMessageCount(prev => ({
        ...prev,
        outputs: prev.outputs + 1
      }));

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: t("error"),
        description: error.message || t("networkConnectionIssue"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleMessage };
};
