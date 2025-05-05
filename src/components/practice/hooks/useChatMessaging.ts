
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

      console.log('Response from AI tutor:', data);
      
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
      
      let translation = data.translation || "";
      
      // Enhanced logging for Tagalog translations
      if (currentLanguage === 'tagalog') {
        console.log('Tagalog translation debug:', {
          originalTranslation: translation,
          translationLength: translation ? translation.length : 0,
          translationType: typeof translation,
          hasTranslation: !!translation,
          dataContent: data.content.substring(0, 50) + '...' // Log just the start of content
        });
        
        // Extra safeguard for Tagalog object responses
        if (typeof translation === 'object') {
          console.warn('Tagalog translation returned as object:', translation);
          
          // Try to extract from potential object structures
          if (translation && 'value' in translation && translation.value) {
            translation = String(translation.value);
          } else if (translation && 'text' in translation && translation.text) {
            translation = String(translation.text);
          } else if (translation && 'content' in translation && translation.content) {
            translation = String(translation.content);
          } else {
            // Reset to empty string if we can't extract a good value
            translation = "";
          }
        }
      }
      
      // Handle special translation cases
      translation = await verifyHindiTranslation(translation, data.content, currentLanguage);
      translation = await verifyFarsiTranslation(translation, data.content, currentLanguage);
      translation = await verifyBengaliTranslation(translation, data.content, currentLanguage);
      translation = await verifyTagalogTranslation(translation, data.content, currentLanguage);
      
      // Enhanced logging after special verification
      if (currentLanguage === 'tagalog') {
        console.log('After verifyTagalogTranslation:', {
          finalTranslation: translation,
          finalType: typeof translation,
          translationLength: translation ? translation.length : 0,
          wasProcessed: translation !== data.translation
        });
      }
      
      if ((!translation || translation === 'undefined' || translation === '[object Object]') && currentLanguage !== "english") {
        console.warn("Missing or invalid translation for", currentLanguage, "user");
        
        // Force getting a translation specifically for Tagalog if it's missing
        if (currentLanguage === 'tagalog') {
          console.log('Forcibly requesting Tagalog translation for missing translation');
          
          // Try up to 3 times to get a valid translation
          let retryCount = 0;
          
          while (retryCount < 3 && (!translation || translation.length < 5 || translation === 'undefined' || translation === '[object Object]')) {
            retryCount++;
            console.log(`Forced Tagalog translation attempt ${retryCount}`);
            
            translation = await getTranslation(data.content, 'tagalog');
            
            if (translation && translation.length > 10 && translation !== 'undefined' && translation !== '[object Object]') {
              console.log('Forced Tagalog translation result:', {
                gotTranslation: !!translation,
                translationLength: translation.length,
                sample: translation.substring(0, 30) + '...'
              });
              break;
            }
          }
          
          // Last resort fallback for Tagalog
          if (!translation || translation.length < 5 || translation === 'undefined' || translation === '[object Object]') {
            translation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
            console.log('Using last resort Tagalog fallback message');
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
