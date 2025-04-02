
import { supabase } from "@/integrations/supabase/client";
import { TranslationResponse } from "../types/chat";

export const useTranslations = () => {
  const getTranslation = async (
    content: string,
    userLanguage: string
  ): Promise<string | undefined> => {
    try {
      // For English users, we want Spanish translations
      // For non-English users, we want translations in their native language
      const targetLanguage = userLanguage === "english" ? "spanish" : userLanguage;
      
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: content,
          userLanguage: targetLanguage,
          requestType: 'translation'
        }
      });
      
      if (!error && data && data.translation) {
        console.log("Got translation manually:", data.translation);
        return data.translation;
      }
      
      return undefined;
    } catch (translationError) {
      console.error("Failed to get translation:", translationError);
      return undefined;
    }
  };

  const processResponseWithTranslation = async (
    data: TranslationResponse,
    userLanguage: string
  ): Promise<TranslationResponse> => {
    // Ensure we always have a translation for all languages
    let translation = data.translation || "";
    
    // If no translation was provided but one is expected, make note of it and try to get one
    if (!translation) {
      console.log("No translation provided for response in language:", userLanguage);
      
      // Try to get a translation manually if none was provided
      const manualTranslation = await getTranslation(data.content, userLanguage);
      if (manualTranslation) {
        translation = manualTranslation;
      }
    }
    
    return {
      content: data.content,
      translation: translation
    };
  };

  return {
    getTranslation,
    processResponseWithTranslation
  };
};
