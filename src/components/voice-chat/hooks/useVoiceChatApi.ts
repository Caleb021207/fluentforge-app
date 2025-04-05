
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Hook for handling voice chat API interactions
 */
export const useVoiceChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();

  /**
   * Process user input by sending to chat API and handling response
   */
  const processChatInput = async (
    text: string,
    apiConversationHistory: { role: string; content: string }[],
    cefrLevel: string = 'B1',
    onSuccess: (content: string, translation: string, updatedHistory: any[]) => void
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: text,
          userLanguage: currentLanguage,
          conversationHistory: apiConversationHistory,
          cefrLevel,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText) {
        console.log("No translation provided for response in language:", currentLanguage);
        
        const targetLanguage = currentLanguage === "english" ? "spanish" : currentLanguage;
        
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: targetLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got translation manually:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      // Calculate updated history
      const updatedHistory = data.updatedHistory || [
        ...apiConversationHistory,
        { role: 'user', content: text },
        { role: 'assistant', content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ];
      
      onSuccess(content, translationText, updatedHistory);
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
    processChatInput
  };
};
