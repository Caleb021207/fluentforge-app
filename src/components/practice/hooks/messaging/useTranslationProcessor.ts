
import { verifyHindiTranslation, verifyFarsiTranslation, verifyBengaliTranslation, verifyTagalogTranslation, verifyChineseTranslation, getTranslation, TranslationType, extractStringFromTranslation } from "../translation";

export const useTranslationProcessor = () => {
  const processTranslation = async (
    translation: TranslationType | undefined,
    content: string,
    language: string
  ): Promise<TranslationType> => {
    if (!translation) {
      return "";
    }
    
    let processedTranslation: TranslationType = translation;
    
    // Enhanced logging for Tagalog and Cantonese translations
    if (language === 'tagalog' || language === 'cantonese') {
      console.log(`Raw ${language} translation from API:`, {
        translation,
        translationType: typeof translation,
        isString: typeof translation === 'string',
        isObject: typeof translation === 'object',
        translationValue: typeof translation === 'string' ? 
          translation.substring(0, 30) + '...' : 
          JSON.stringify(translation).substring(0, 30) + '...'
      });
    }
    
    // Handle special translation cases by passing the translation to the proper verification methods
    if (translation) {
      if (language === 'hindi') {
        processedTranslation = await verifyHindiTranslation(translation, content, language);
      } else if (language === 'farsi') {
        processedTranslation = await verifyFarsiTranslation(translation, content, language);
      } else if (language === 'bengali') {
        processedTranslation = await verifyBengaliTranslation(translation, content, language);
      } else if (language === 'tagalog') {
        processedTranslation = await verifyTagalogTranslation(translation, content, language);
        console.log('After verifyTagalogTranslation:', {
          translationType: typeof processedTranslation,
          translationSample: typeof processedTranslation === 'string' ? 
            processedTranslation.substring(0, 30) + '...' :
            JSON.stringify(processedTranslation).substring(0, 30) + '...'
        });
      } else if (language === 'cantonese' || language === 'mandarin') {
        processedTranslation = await verifyChineseTranslation(translation, content, language);
        console.log(`After verify${language === 'cantonese' ? 'Cantonese' : 'Mandarin'}Translation:`, {
          translationType: typeof processedTranslation,
          translationSample: typeof processedTranslation === 'string' ? 
            processedTranslation.substring(0, 30) + '...' :
            JSON.stringify(processedTranslation).substring(0, 30) + '...'
        });
      }
    }
    
    // Handle missing translations - force getting a new one
    if ((!processedTranslation || 
         (typeof processedTranslation === 'string' && processedTranslation.length < 5) ||
         (typeof processedTranslation === 'object' && Object.keys(processedTranslation).length === 0)) && 
        language !== "english") {
      console.warn("Missing or invalid translation for", language, "user");
      
      // Force getting a translation specifically for Tagalog or Cantonese if it's missing
      if (language === 'tagalog') {
        console.log('Forcibly requesting Tagalog translation for missing translation');
        
        // Try up to 3 times to get a valid translation
        let retryCount = 0;
        let validTranslation = false;
        
        while (retryCount < 3 && !validTranslation) {
          retryCount++;
          console.log(`Forced Tagalog translation attempt ${retryCount}`);
          
          const newTranslation = await getTranslation(content, 'tagalog');
          
          if (newTranslation && newTranslation.length > 10) {
            processedTranslation = newTranslation;
            validTranslation = true;
            console.log('Successfully got forced Tagalog translation:', {
              length: newTranslation.length,
              sample: newTranslation.substring(0, 30) + '...'
            });
            break;
          }
        }
        
        // Fallback for Tagalog if all retries failed
        if (!validTranslation) {
          processedTranslation = "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
          console.log('Using fallback Tagalog message after failed retries');
        }
      } else if (language === 'cantonese') {
        console.log('Forcibly requesting Cantonese translation for missing translation');
        
        // Try up to 3 times to get a valid translation
        let retryCount = 0;
        let validTranslation = false;
        
        while (retryCount < 3 && !validTranslation) {
          retryCount++;
          console.log(`Forced Cantonese translation attempt ${retryCount}`);
          
          const newTranslation = await getTranslation(content, 'cantonese');
          
          if (newTranslation && newTranslation.length > 10) {
            processedTranslation = newTranslation;
            validTranslation = true;
            console.log('Successfully got forced Cantonese translation:', {
              length: newTranslation.length,
              sample: newTranslation.substring(0, 30) + '...'
            });
            break;
          }
        }
        
        // Fallback for Cantonese if all retries failed
        if (!validTranslation) {
          processedTranslation = "翻譯暫時不可用。請諒解不便之處。";
          console.log('Using fallback Cantonese message after failed retries');
        }
      } else {
        processedTranslation = await getTranslation(content, language);
      }
    }
    
    return processedTranslation;
  };

  return {
    processTranslation,
    extractStringFromTranslation
  };
};
