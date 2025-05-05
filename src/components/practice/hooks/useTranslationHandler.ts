
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { TRANSLATION_REQUIRED_LANGUAGES } from "@/utils/languageConstants";

export const useTranslationHandler = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  /**
   * Gets translation for a message using the Supabase edge function
   */
  const getTranslation = async (content: string, targetLanguage: string): Promise<string> => {
    if (!content || content.trim() === "") {
      return "";
    }
    
    try {
      console.log(`Requesting translation for ${targetLanguage}:`, content.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: content,
          userLanguage: targetLanguage,
          requestType: 'translation'
        }
      });

      if (error) {
        console.error('Translation error:', error);
        toast({
          title: t("translationError"),
          description: t("failedToGetTranslation"),
          variant: "destructive",
        });
        return "";
      }

      const translation = data?.translation || "";
      console.log(`Got ${targetLanguage} translation:`, {
        success: !!translation,
        length: translation.length,
        sample: translation.substring(0, 50) + '...'
      });
      
      return translation;
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
  
  /**
   * Special case for Farsi translations to ensure they use proper Farsi script
   */
  const verifyFarsiTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'farsi') return translation;
    
    // Check if the translation contains Arabic script (used in Farsi)
    const containsFarsi = /[\u0600-\u06FF]/.test(translation);
    
    if (!containsFarsi && userLanguage === 'farsi') {
      console.log('Getting proper Farsi translation with Persian script');
      return await getTranslation(originalContent, 'farsi');
    }
    
    return translation;
  };

  /**
   * Special case for Bengali translations to ensure they use proper Bengali script
   */
  const verifyBengaliTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'bengali') return translation;
    
    // Check if the translation contains Bengali script
    const containsBengali = /[\u0980-\u09FF]/.test(translation);
    
    if (!containsBengali && userLanguage === 'bengali') {
      console.log('Getting proper Bengali translation with Bengali script');
      return await getTranslation(originalContent, 'bengali');
    }
    
    return translation;
  };

  /**
   * Enhanced special case handling for Tagalog translations
   */
  const verifyTagalogTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'tagalog') return translation;
    
    console.log('Verifying Tagalog translation:', {
      hasTranslation: !!translation,
      translationLength: translation ? translation.length : 0,
      shortContentPreview: originalContent.substring(0, 30) + '...'
    });
    
    // More aggressive checks for Tagalog to ensure we get a translation
    if (!translation || translation.length < 10 || translation.includes('Translation not available')) {
      console.log('Getting proper Tagalog translation - inadequate translation detected');
      const newTranslation = await getTranslation(originalContent, 'tagalog');
      
      if (newTranslation && newTranslation.length > 5) {
        console.log('Successfully obtained new Tagalog translation:', {
          length: newTranslation.length,
          preview: newTranslation.substring(0, 30) + '...'
        });
        return newTranslation;
      } else {
        console.log('Failed to get proper Tagalog translation on retry');
      }
    }
    
    return translation;
  };

  /**
   * Check if a translation is needed for the current language
   */
  const needsTranslation = (language: string): boolean => {
    return TRANSLATION_REQUIRED_LANGUAGES.includes(language.toLowerCase());
  };

  return {
    getTranslation,
    verifyHindiTranslation,
    verifyFarsiTranslation,
    verifyBengaliTranslation,
    verifyTagalogTranslation,
    needsTranslation
  };
};
