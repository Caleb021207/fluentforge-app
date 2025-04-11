
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";

export const useTranslationHandler = () => {
  const { currentLanguage } = useLocalization();

  /**
   * Gets translation for a message using the Supabase edge function
   */
  const getTranslation = async (content: string, targetLanguage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: content,
          userLanguage: targetLanguage,
          requestType: 'translation'
        }
      });

      if (error) {
        console.error('Translation error:', error);
        return "";
      }

      return data.translation || "";
    } catch (error) {
      console.error('Failed to get translation:', error);
      return "";
    }
  };

  /**
   * Special case for Hindi translations to ensure they use Devanagari script
   */
  const verifyHindiTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'hindi') return translation;
    
    // Check if the translation contains Devanagari script (used in Hindi)
    const containsDevanagari = /[\u0900-\u097F]/.test(translation);
    
    if (!containsDevanagari && userLanguage === 'hindi') {
      console.log('Getting proper Hindi translation with Devanagari script');
      return await getTranslation(originalContent, 'hindi');
    }
    
    return translation;
  };

  return {
    getTranslation,
    verifyHindiTranslation
  };
};
