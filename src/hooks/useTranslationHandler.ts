
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
        } else if (typeof data.translation === 'object' && data.translation !== null) {
          // Log the unexpected object format
          console.warn('Translation returned as object instead of string:', data.translation);
          
          // Try to extract string from common object patterns
          const translationObj = data.translation as Record<string, unknown>;
          
          if ('value' in translationObj && typeof translationObj.value === 'string') {
            translation = translationObj.value;
          } else if ('text' in translationObj && typeof translationObj.text === 'string') {
            translation = translationObj.text;
          } else if ('content' in translationObj && typeof translationObj.content === 'string') {
            translation = translationObj.content;
          } else {
            // Last resort - try to convert the entire object to a string
            try {
              translation = JSON.stringify(translationObj);
              // Remove quotes and curly braces if it looks like a stringified simple object
              if (translation.startsWith('{') && translation.endsWith('}')) {
                translation = translation.replace(/[{}'"]/g, '').replace(/:/g, ': ');
              }
            } catch (e) {
              console.error('Failed to stringify translation object:', e);
            }
          }
        } else {
          // Try to convert any non-string, non-object value to string
          try {
            translation = String(data.translation);
          } catch (e) {
            console.error('Error converting translation to string:', e);
          }
        }
      }

      // Special validation for Tagalog
      if (targetLanguage === 'tagalog') {
        console.log(`Got Tagalog translation:`, {
          success: !!translation,
          length: translation.length,
          sample: translation.substring(0, 50) + '...',
          type: typeof translation
        });
        
        // Ensure Tagalog translation is valid
        if (!translation || 
            translation === 'undefined' || 
            translation === '[object Object]' ||
            translation.length < 10) {
          
          translation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
          console.log('Using fallback Tagalog message due to invalid translation');
        }
      } else {
        console.log(`Got ${targetLanguage} translation:`, {
          success: !!translation,
          length: translation.length,
          sample: translation.substring(0, 50) + '...'
        });
      }
      
      return translation;
    } catch (error) {
      console.error('Failed to get translation:', error);
      
      // Special fallback for Tagalog
      if (targetLanguage === 'tagalog') {
        return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
      }
      
      return "";
    }
  };

  /**
   * Convert any translation format to string
   */
  const extractStringFromTranslation = (translation: string | Record<string, unknown>): string => {
    if (typeof translation === 'string') {
      return translation;
    }
    
    if (typeof translation === 'object' && translation !== null) {
      const translationObj = translation as Record<string, unknown>;
      
      if ('value' in translationObj && translationObj.value) {
        return String(translationObj.value);
      } 
      
      if ('text' in translationObj && translationObj.text) {
        return String(translationObj.text);
      } 
      
      if ('content' in translationObj && translationObj.content) {
        return String(translationObj.content);
      }
      
      // Try JSON stringify as last resort
      try {
        const stringified = JSON.stringify(translationObj);
        if (stringified && stringified !== '{}' && stringified !== '[]') {
          // Clean up the stringified output
          if (stringified.startsWith('{') && stringified.endsWith('}')) {
            return stringified.replace(/[{}'"]/g, '').replace(/:/g, ': ');
          }
          return stringified;
        }
      } catch (e) {
        console.error('Failed to stringify translation object:', e);
      }
    }
    
    // Try to convert any other type to string
    try {
      return String(translation);
    } catch (e) {
      console.error('Error converting translation to string:', e);
      return "";
    }
  };

  /**
   * Special case for Hindi translations to ensure they use Devanagari script
   */
  const verifyHindiTranslation = async (
    translation: string | Record<string, unknown>, 
    originalContent: string,
    userLanguage: string
  ): Promise<string> => {
    if (userLanguage !== 'hindi') return extractStringFromTranslation(translation);
    
    // Extract string if needed
    const translationText = extractStringFromTranslation(translation);
    
    // Check if the translation contains Devanagari script (used in Hindi)
    const containsDevanagari = /[\u0900-\u097F]/.test(translationText);
    
    if (!containsDevanagari) {
      console.log('Getting proper Hindi translation with Devanagari script');
      return await getTranslation(originalContent, 'hindi');
    }
    
    return translationText;
  };
  
  /**
   * Special case for Farsi translations to ensure they use proper Farsi script
   */
  const verifyFarsiTranslation = async (
    translation: string | Record<string, unknown>, 
    originalContent: string,
    userLanguage: string
  ): Promise<string> => {
    if (userLanguage !== 'farsi') return extractStringFromTranslation(translation);
    
    // Extract string if needed
    const translationText = extractStringFromTranslation(translation);
    
    // Check if the translation contains Arabic script (used in Farsi)
    const containsFarsi = /[\u0600-\u06FF]/.test(translationText);
    
    if (!containsFarsi) {
      console.log('Getting proper Farsi translation with Persian script');
      return await getTranslation(originalContent, 'farsi');
    }
    
    return translationText;
  };

  /**
   * Special case for Bengali translations to ensure they use proper Bengali script
   */
  const verifyBengaliTranslation = async (
    translation: string | Record<string, unknown>, 
    originalContent: string,
    userLanguage: string
  ): Promise<string> => {
    if (userLanguage !== 'bengali') return extractStringFromTranslation(translation);
    
    // Extract string if needed
    const translationText = extractStringFromTranslation(translation);
    
    // Check if the translation contains Bengali script
    const containsBengali = /[\u0980-\u09FF]/.test(translationText);
    
    if (!containsBengali) {
      console.log('Getting proper Bengali translation with Bengali script');
      return await getTranslation(originalContent, 'bengali');
    }
    
    return translationText;
  };
  
  /**
   * Enhanced special case handling for Tagalog translations
   */
  const verifyTagalogTranslation = async (
    translation: string | Record<string, unknown>, 
    originalContent: string,
    userLanguage: string
  ): Promise<string> => {
    if (userLanguage !== 'tagalog') return extractStringFromTranslation(translation);
    
    // First, extract a string value from whatever format we received
    const translationText = extractStringFromTranslation(translation);
    
    console.log('Verifying Tagalog translation:', {
      hasTranslation: !!translationText,
      translationLength: translationText ? translationText.length : 0,
      shortContentPreview: originalContent.substring(0, 30) + '...'
    });
    
    // Check for valid Tagalog translation
    if (!translationText || 
        translationText === 'undefined' || 
        translationText === '[object Object]' ||
        translationText.length < 10 || 
        translationText.includes('Translation not available')) {
      
      console.log('Getting proper Tagalog translation - inadequate translation detected');
      
      // Try up to 3 times to get a valid translation
      let retryCount = 0;
      let validTranslation = false;
      let bestTranslation = translationText;
      
      while (retryCount < 3 && !validTranslation) {
        retryCount++;
        console.log(`Tagalog translation retry attempt ${retryCount}`);
        
        const newTranslation = await getTranslation(originalContent, 'tagalog');
        
        // Extra validation - ensure it's not an object/undefined
        if (newTranslation && 
            newTranslation !== 'undefined' && 
            newTranslation !== '[object Object]' &&
            newTranslation.length > 10) {
          
          bestTranslation = newTranslation;
          validTranslation = true;
          console.log('Successfully obtained new Tagalog translation:', {
            length: newTranslation.length,
            preview: newTranslation.substring(0, 30) + '...'
          });
          break;
        }
      }
      
      // Final fallback for Tagalog
      if (!validTranslation && bestTranslation.length < 10) {
        console.log('Failed to get proper Tagalog translation after multiple retries');
        return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
      }
      
      return bestTranslation;
    }
    
    return translationText;
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
