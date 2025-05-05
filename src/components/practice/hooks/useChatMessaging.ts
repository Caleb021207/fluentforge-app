
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
      
      // Process translation - ensure it's a string
      let translation = "";
      
      if (data.translation) {
        // Direct string assignment if it's already a string
        if (typeof data.translation === 'string') {
          translation = data.translation;
        } 
        // Handle object format
        else if (typeof data.translation === 'object' && data.translation !== null) {
          console.warn('Translation returned as object:', data.translation);
          
          // Try to extract from potential object structures
          const translationObj = data.translation as Record<string, unknown>;
          
          if ('value' in translationObj && typeof translationObj.value === 'string') {
            translation = translationObj.value;
          } else if ('text' in translationObj && typeof translationObj.text === 'string') {
            translation = translationObj.text;
          } else if ('content' in translationObj && typeof translationObj.content === 'string') {
            translation = translationObj.content;
          } else {
            // Try JSON stringify as last resort
            try {
              translation = JSON.stringify(translationObj);
            } catch (e) {
              console.error('Failed to stringify translation object:', e);
              translation = "";
            }
          }
        }
        // For any other type, attempt string conversion
        else {
          try {
            translation = String(data.translation);
          } catch (e) {
            console.error('Error converting translation to string:', e);
            translation = "";
          }
        }
      }
      
      // Enhanced logging for Tagalog translations
      if (currentLanguage === 'tagalog') {
        console.log('Tagalog translation debug:', {
          originalTranslation: data.translation,
          processedTranslation: translation,
          translationLength: translation ? translation.length : 0,
          translationType: typeof translation,
          hasTranslation: !!translation,
          dataContent: data.content.substring(0, 50) + '...' // Log just the start of content
        });
      }
      
      // Detect invalid translations
      if (translation === 'undefined' || translation === '[object Object]') {
        console.warn(`Invalid translation value detected: "${translation}"`);
        translation = "";
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
      
      // Handle missing translations - force getting a new one
      if ((!translation || translation.length < 5) && currentLanguage !== "english") {
        console.warn("Missing or invalid translation for", currentLanguage, "user");
        
        // Force getting a translation specifically for Tagalog if it's missing
        if (currentLanguage === 'tagalog') {
          console.log('Forcibly requesting Tagalog translation for missing translation');
          
          // Try up to 3 times to get a valid translation
          let retryCount = 0;
          
          while (retryCount < 3 && (!translation || translation.length < 5)) {
            retryCount++;
            console.log(`Forced Tagalog translation attempt ${retryCount}`);
            
            translation = await getTranslation(data.content, 'tagalog');
            
            if (translation && translation.length > 10) {
              console.log('Forced Tagalog translation result:', {
                gotTranslation: !!translation,
                translationLength: translation.length,
                sample: translation.substring(0, 30) + '...'
              });
              break;
            }
          }
          
          // Last resort fallback for Tagalog
          if (!translation || translation.length < 5) {
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
