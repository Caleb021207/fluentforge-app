
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
      
      // Use chat-with-gpt endpoint
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
          hasTranslation: !!translation,
          dataContent: data.content.substring(0, 50) + '...' // Log just the start of content
        });
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
          translationLength: translation ? translation.length : 0,
          wasProcessed: translation !== data.translation
        });
      }
      
      if (!translation && currentLanguage !== "english") {
        console.warn("Missing translation for", currentLanguage, "user");
        
        // Force getting a translation specifically for Tagalog if it's missing
        if (currentLanguage === 'tagalog') {
          console.log('Forcibly requesting Tagalog translation for missing translation');
          translation = await getTranslation(data.content, 'tagalog');
          console.log('Forced Tagalog translation result:', {
            gotTranslation: !!translation,
            translationLength: translation ? translation.length : 0
          });
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
