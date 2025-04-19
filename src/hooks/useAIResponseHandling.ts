
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface UseAIResponseHandlingProps {
  onResponseReceived: (content: string, translation: string) => void;
  apiConversationHistory: { role: string; content: string }[];
  setApiConversationHistory: (history: { role: string; content: string }[]) => void;
  cefrLevel: string;
}

export const useAIResponseHandling = ({
  onResponseReceived,
  apiConversationHistory,
  setApiConversationHistory,
  cefrLevel
}: UseAIResponseHandlingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel: cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText && currentLanguage === "hindi") {
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got Hindi translation:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get Hindi translation:", translationError);
        }
      }
      
      onResponseReceived(content, translationText);
      
      setApiConversationHistory([
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ]);

    } catch (error) {
      console.error('Error getting GPT response:', error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
