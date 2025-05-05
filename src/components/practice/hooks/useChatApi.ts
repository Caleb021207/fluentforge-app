
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";
import { handleConnectionError } from "@/utils/authErrorHandler";

export const useChatApi = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  // Helper function to extract string from object-like translations
  const processTranslation = (translation: any): string => {
    if (!translation) return "";
    
    if (typeof translation === 'string') {
      return translation;
    }
    
    if (typeof translation === 'object' && translation !== null) {
      // Try to extract from common object patterns
      if ('value' in translation && translation.value) {
        return String(translation.value);
      } 
      if ('text' in translation && translation.text) {
        return String(translation.text);
      } 
      if ('content' in translation && translation.content) {
        return String(translation.content);
      }
      
      // Try to stringify the object
      try {
        return JSON.stringify(translation);
      } catch (e) {
        console.error('Error stringifying translation object:', e);
      }
    }
    
    // Last resort - try to convert to string
    try {
      return String(translation);
    } catch (e) {
      console.error('Error converting translation to string:', e);
      return "";
    }
  };

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
        const reconnected = await handleConnectionError();
        if (!reconnected) {
          throw error;
        }
        
        const retryResponse = await supabase.functions.invoke('chat-with-tutor', {
          body: {
            message: input,
            userLanguage: currentLanguage,
          },
        });
        
        if (retryResponse.error) {
          throw retryResponse.error;
        }

        // Track successful text practice call
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('api_calls_tracking')
            .insert({
              user_id: user.id,
              call_type: 'text_practice'
            });
        }

        // Enhanced logging for Tagalog translations
        if (currentLanguage === 'tagalog') {
          console.log('useChatApi Tagalog response:', {
            responseTranslation: retryResponse.data.translation,
            translationType: typeof retryResponse.data.translation
          });
        }
        
        // Process the translation to ensure it's a string
        const processedTranslation = processTranslation(retryResponse.data.translation);
        
        return {
          role: "assistant",
          content: retryResponse.data.content,
          translation: processedTranslation
        };
      }

      if (!data || !data.content) {
        throw new Error("Invalid response from tutor");
      }

      // Track successful text practice call
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('api_calls_tracking')
          .insert({
            user_id: user.id,
            call_type: 'text_practice'
          });
      }

      // Enhanced logging for Tagalog translations
      if (currentLanguage === 'tagalog') {
        console.log('useChatApi Tagalog response:', {
          responseTranslation: data.translation,
          translationType: typeof data.translation,
          translationSample: typeof data.translation === 'string' ? 
            data.translation.substring(0, 30) + '...' : 
            JSON.stringify(data.translation).substring(0, 30) + '...'
        });
      }
      
      // Process the translation to ensure it's a string
      const processedTranslation = processTranslation(data.translation);
      
      return {
        role: "assistant",
        content: data.content,
        translation: processedTranslation
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
