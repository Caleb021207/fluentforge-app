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

      // Enhanced translation handling
      let translation = "";
      
      if (data?.translation) {
        if (typeof data.translation === 'string') {
          translation = data.translation;
        } else if (typeof data.translation === 'object') {
          // Log the unexpected object format
          console.warn('Translation returned as object instead of string:', data.translation);
          
          // Try to extract string from common object patterns
          if (data.translation.value) {
            translation = String(data.translation.value);
          } else if (data.translation.text) {
            translation = String(data.translation.text);
          } else if (data.translation.content) {
            translation = String(data.translation.content);
          } else {
            // Last resort - try to convert the entire object to a string
            try {
              translation = JSON.stringify(data.translation);
              // Remove quotes and curly braces if it looks like a stringified simple object
              if (translation.startsWith('{') && translation.endsWith('}')) {
                translation = translation.replace(/[{}'"]/g, '').replace(/:/g, ': ');
              }
            } catch (e) {
              console.error('Failed to stringify translation object:', e);
            }
          }
        }
      }

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
      translationType: typeof translation,
      shortContentPreview: originalContent.substring(0, 30) + '...'
    });
    
    // More aggressive checks for Tagalog to ensure we get a translation
    if (!translation || 
        translation.length < 10 || 
        translation.includes('Translation not available') ||
        translation === 'undefined' ||
        translation === '[object Object]') {
      
      console.log('Getting proper Tagalog translation - inadequate translation detected');
      
      // Try up to 3 times to get a valid translation
      let retryCount = 0;
      let newTranslation = "";
      
      while (retryCount < 3 && (!newTranslation || newTranslation.length < 10)) {
        retryCount++;
        console.log(`Tagalog translation retry attempt ${retryCount}`);
        
        newTranslation = await getTranslation(originalContent, 'tagalog');
        
        // Extra validation - ensure it's not an object/undefined
        if (newTranslation === 'undefined' || newTranslation === '[object Object]') {
          newTranslation = "";
        }
        
        // If we get a good translation, use it
        if (newTranslation && newTranslation.length > 10) {
          console.log('Successfully obtained new Tagalog translation:', {
            length: newTranslation.length,
            preview: newTranslation.substring(0, 30) + '...'
          });
          return newTranslation;
        }
      }
      
      if (!newTranslation || newTranslation.length < 10) {
        console.log('Failed to get proper Tagalog translation after multiple retries');
        // Last resort - return a manual placeholder in Tagalog if all else fails
        return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala."; // "Translation not available at the moment. Sorry for the inconvenience." in Tagalog
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
