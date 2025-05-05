
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { logDataAccess } from "@/utils/contentSafetyUtils";
import { useTranslationHandler } from "@/components/practice/hooks/useTranslationHandler";

export const useChatMessaging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { 
    getTranslation, 
    verifyHindiTranslation, 
    verifyFarsiTranslation, 
    verifyBengaliTranslation,
    verifyTagalogTranslation 
  } = useTranslationHandler();

  const sendChatMessage = async (message: string) => {
    if (!message || message.trim() === "") {
      toast({
        title: t("error"),
        description: t("emptyMessage"),
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    setHasError(false);

    try {
      const userId = "anonymous-or-current-user-id";
      logDataAccess(
        userId,
        "practice_session", 
        "student",
        "language_practice"
      );
      
      // Get the targetLanguage from localStorage 
      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      
      console.log('Sending message to AI tutor:', { 
        message, 
        userLanguage: currentLanguage, 
        targetLanguage, 
        requestTranslation: true 
      });
      
      // Use chat-with-tutor endpoint
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: message,
          userLanguage: currentLanguage,
          targetLanguage: targetLanguage,
          requestTranslation: true
        }
      });

      if (error) {
        console.error('Supabase invoke error:', error);
        throw error;
      }

      if (currentLanguage === 'tagalog') {
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
      
      // Process translation - ensure it's a string
      let translation: string | Record<string, unknown> = "";
      
      if (data.translation) {
        translation = data.translation;
        
        // Enhanced logging for Tagalog translations
        if (currentLanguage === 'tagalog') {
          console.log('Raw Tagalog translation from API:', {
            translation,
            translationType: typeof translation,
            isString: typeof translation === 'string',
            isObject: typeof translation === 'object',
            translationValue: typeof translation === 'string' ? 
              translation.substring(0, 30) + '...' : 
              JSON.stringify(translation).substring(0, 30) + '...'
          });
        }
      }
      
      // Handle special translation cases - passing the translation to the proper verification methods
      // The verification methods will handle both string and object translations
      if (translation) {
        if (currentLanguage === 'hindi') {
          translation = await verifyHindiTranslation(translation, data.content, currentLanguage);
        } else if (currentLanguage === 'farsi') {
          translation = await verifyFarsiTranslation(translation, data.content, currentLanguage);
        } else if (currentLanguage === 'bengali') {
          translation = await verifyBengaliTranslation(translation, data.content, currentLanguage);
        } else if (currentLanguage === 'tagalog') {
          translation = await verifyTagalogTranslation(translation, data.content, currentLanguage);
          console.log('After verifyTagalogTranslation:', {
            translationType: typeof translation,
            translationSample: typeof translation === 'string' ? 
              translation.substring(0, 30) + '...' :
              JSON.stringify(translation).substring(0, 30) + '...'
          });
        }
      }
      
      // Handle missing translations - force getting a new one
      // Don't convert to string here - let the components handle it
      if ((!translation || 
           (typeof translation === 'string' && translation.length < 5)) && 
          currentLanguage !== "english") {
        console.warn("Missing or invalid translation for", currentLanguage, "user");
        
        // Force getting a translation specifically for Tagalog if it's missing
        if (currentLanguage === 'tagalog') {
          console.log('Forcibly requesting Tagalog translation for missing translation');
          
          // Try up to 3 times to get a valid translation
          let retryCount = 0;
          let validTranslation = false;
          
          while (retryCount < 3 && !validTranslation) {
            retryCount++;
            console.log(`Forced Tagalog translation attempt ${retryCount}`);
            
            const newTranslation = await getTranslation(data.content, 'tagalog');
            
            if (newTranslation && typeof newTranslation === 'string' && newTranslation.length > 10) {
              translation = newTranslation;
              validTranslation = true;
              console.log('Successfully got forced Tagalog translation:', {
                length: newTranslation.length,
                sample: newTranslation.substring(0, 30) + '...'
              });
              break;
            }
          }
          
          // Fallback for Tagalog if all retries failed
          if (!validTranslation) {
            translation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
            console.log('Using fallback Tagalog message after failed retries');
          }
        } else {
          translation = await getTranslation(data.content, currentLanguage);
        }
      }
      
      return {
        content: data.content,
        translation
      };
      
    } catch (error) {
      console.error('Error:', error);
      setHasError(true);
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

  const retryLastMessage = async (message: string) => {
    if (hasError) {
      setHasError(false);
      return await sendChatMessage(message);
    }
    return null;
  };

  return {
    isLoading,
    hasError,
    setIsLoading,
    sendChatMessage,
    retryLastMessage
  };
};
