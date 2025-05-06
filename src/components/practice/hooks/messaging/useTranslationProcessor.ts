
import { verifyHindiTranslation, verifyFarsiTranslation, verifyBengaliTranslation, verifyTagalogTranslation, verifyChineseTranslation, verifyThaiTranslation, getTranslation, TranslationType, extractStringFromTranslation } from "../translation";

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
    const lowercaseLanguage = language.toLowerCase();
    
    // Enhanced logging for specific languages
    if (['tagalog', 'cantonese', 'thai'].includes(lowercaseLanguage)) {
      console.log(`Raw ${language} translation from API:`, {
        translation,
        translationType: typeof translation,
        isString: typeof translation === 'string',
        isObject: typeof translation === 'object',
        translationValue: typeof translation === 'string' ? 
          translation.substring(0, 30) + '...' : 
          JSON.stringify(translation).substring(0, 30) + '...',
        containsScript: typeof translation === 'string' ? 
          (lowercaseLanguage === 'thai' ? /[\u0E00-\u0E7F]/.test(translation) : 'N/A') : 'N/A'
      });
    }
    
    // Handle special translation cases by passing the translation to the proper verification methods
    if (translation) {
      if (lowercaseLanguage === 'hindi') {
        processedTranslation = await verifyHindiTranslation(translation, content, language);
      } else if (lowercaseLanguage === 'farsi') {
        processedTranslation = await verifyFarsiTranslation(translation, content, language);
      } else if (lowercaseLanguage === 'bengali') {
        processedTranslation = await verifyBengaliTranslation(translation, content, language);
      } else if (lowercaseLanguage === 'tagalog') {
        processedTranslation = await verifyTagalogTranslation(translation, content, language);
        console.log('After verifyTagalogTranslation:', {
          translationType: typeof processedTranslation,
          translationSample: typeof processedTranslation === 'string' ? 
            processedTranslation.substring(0, 30) + '...' :
            JSON.stringify(processedTranslation).substring(0, 30) + '...'
        });
      } else if (lowercaseLanguage === 'cantonese' || lowercaseLanguage === 'mandarin') {
        processedTranslation = await verifyChineseTranslation(translation, content, language);
        console.log(`After verify${lowercaseLanguage === 'cantonese' ? 'Cantonese' : 'Mandarin'}Translation:`, {
          translationType: typeof processedTranslation,
          translationSample: typeof processedTranslation === 'string' ? 
            processedTranslation.substring(0, 30) + '...' :
            JSON.stringify(processedTranslation).substring(0, 30) + '...'
        });
      } else if (lowercaseLanguage === 'thai') {
        processedTranslation = await verifyThaiTranslation(translation, content, language);
        console.log('After verifyThaiTranslation:', {
          translationType: typeof processedTranslation,
          translationSample: typeof processedTranslation === 'string' ? 
            processedTranslation.substring(0, 30) + '...' :
            JSON.stringify(processedTranslation).substring(0, 30) + '...',
          containsThaiScript: typeof processedTranslation === 'string' ? 
            /[\u0E00-\u0E7F]/.test(processedTranslation) : false,
          isSameAsContent: typeof processedTranslation === 'string' ? 
            processedTranslation.trim() === content.trim() : false
        });
      }
    }
    
    // Handle missing translations - force getting a new one
    if ((!processedTranslation || 
         (typeof processedTranslation === 'string' && processedTranslation.length < 5) ||
         (typeof processedTranslation === 'object' && Object.keys(processedTranslation).length === 0)) && 
        lowercaseLanguage !== "english") {
      console.warn("Missing or invalid translation for", language, "user");
      
      // Force getting a translation for specific languages if it's missing
      if (lowercaseLanguage === 'tagalog') {
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
      } else if (lowercaseLanguage === 'cantonese') {
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
      } else if (lowercaseLanguage === 'thai') {
        console.log('Forcibly requesting Thai translation for missing translation');
        
        // Try up to 3 times to get a valid translation
        let retryCount = 0;
        let validTranslation = false;
        
        while (retryCount < 3 && !validTranslation) {
          retryCount++;
          console.log(`Forced Thai translation attempt ${retryCount}`);
          
          const newTranslation = await getTranslation(content, 'thai');
          
          // Special checks for Thai - must contain Thai script
          if (newTranslation && 
              newTranslation.length > 10 && 
              /[\u0E00-\u0E7F]/.test(newTranslation) &&
              newTranslation.trim() !== content.trim()) {
            
            processedTranslation = newTranslation;
            validTranslation = true;
            console.log('Successfully got forced Thai translation with Thai script:', {
              length: newTranslation.length,
              sample: newTranslation.substring(0, 30) + '...',
              containsThaiScript: /[\u0E00-\u0E7F]/.test(newTranslation)
            });
            break;
          }
        }
        
        // Fallback for Thai if all retries failed
        if (!validTranslation) {
          processedTranslation = "ไม่สามารถแสดงคำแปลได้ในขณะนี้ ขออภัยในความไม่สะดวก";
          console.log('Using fallback Thai message after failed retries');
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
