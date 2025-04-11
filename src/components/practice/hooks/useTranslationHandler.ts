
import { supabase } from "@/integrations/supabase/client";
import { containsScript } from "@/utils/languageUtils";

export const useTranslationHandler = () => {
  const getTranslation = async (content: string, language: string): Promise<string> => {
    // If content is empty, no need to translate
    if (!content) return "";

    try {
      // First attempt to get translation from existing response
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: {
          message: content,
          userLanguage: language,
          requestType: 'translation'
        }
      });
      
      if (error) {
        console.error("Translation error:", error);
        return "";
      }
      
      if (data && data.translation) {
        console.log(`Got translation for ${language}:`, data.translation);
        return data.translation;
      }
      
      return "";
    } catch (error) {
      console.error("Failed to get translation:", error);
      return "";
    }
  };

  const verifyHindiTranslation = async (translation: string, content: string, language: string): Promise<string> => {
    // Only proceed for Hindi translations
    if (language !== "hindi") return translation;
    
    // Check if Hindi translation contains Devanagari script
    if (translation && !containsScript(translation, "devanagari")) {
      console.log("Hindi translation doesn't contain Devanagari script, requesting specific translation");
      
      try {
        const newTranslation = await getTranslation(content, language);
        if (newTranslation) {
          console.log("Got Hindi translation with Devanagari script:", newTranslation);
          return newTranslation;
        }
      } catch (translationError) {
        console.error("Failed to get Hindi translation:", translationError);
      }
    }
    
    return translation;
  };

  return {
    getTranslation,
    verifyHindiTranslation
  };
};
