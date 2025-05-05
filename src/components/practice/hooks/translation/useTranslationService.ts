
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { TranslationType } from "./types";

/**
 * Gets translation for a message using the Supabase edge function
 */
export const getTranslation = async (content: string, targetLanguage: string): Promise<string> => {
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
      return "";
    }

    // Enhanced translation handling
    let translation = "";
    
    if (data?.translation) {
      if (typeof data.translation === 'string') {
        translation = data.translation;
      } else if (typeof data.translation === 'object' && data.translation !== null) {
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

export const useTranslationService = () => {
  const { t } = useLocalization();
  const { toast } = useToast();

  const requestTranslation = async (content: string, targetLanguage: string): Promise<string> => {
    try {
      const translation = await getTranslation(content, targetLanguage);
      return translation;
    } catch (error) {
      console.error('Translation service error:', error);
      toast({
        title: t("translationError"),
        description: t("failedToGetTranslation"),
        variant: "destructive",
      });
      return "";
    }
  };

  return {
    requestTranslation
  };
};
