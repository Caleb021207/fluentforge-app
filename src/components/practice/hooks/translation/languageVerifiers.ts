
import { TranslationType } from "./types";
import { extractStringFromTranslation } from "./translationUtils";
import { getTranslation } from "./useTranslationService";

/**
 * Special case for Hindi translations to ensure they use Devanagari script
 */
export const verifyHindiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<TranslationType> => {
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
export const verifyFarsiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<TranslationType> => {
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
export const verifyBengaliTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<TranslationType> => {
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
export const verifyTagalogTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<TranslationType> => {
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
 * Special case handling for Chinese (Cantonese/Mandarin) translations
 */
export const verifyChineseTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<TranslationType> => {
  if (userLanguage !== 'cantonese' && userLanguage !== 'mandarin') {
    return extractStringFromTranslation(translation);
  }
  
  // First, extract a string value from whatever format we received
  const translationText = extractStringFromTranslation(translation);
  
  console.log(`Verifying ${userLanguage} translation:`, {
    hasTranslation: !!translationText,
    translationLength: translationText ? translationText.length : 0,
    shortContentPreview: originalContent.substring(0, 30) + '...'
  });
  
  // Check if the translation contains Chinese characters
  const containsChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/.test(translationText);
  
  // Check if there are non-Chinese characters that suggest mixed language
  // This regex looks for substantial Latin script (likely indicating other languages)
  const containsSubstantialLatinScript = /[a-zA-Z]{4,}/.test(translationText);
  
  if (!translationText || 
      translationText === 'undefined' || 
      translationText === '[object Object]' ||
      translationText.length < 10 || 
      !containsChineseChars ||
      containsSubstantialLatinScript) {
    
    console.log(`Getting proper ${userLanguage} translation - inadequate translation detected`);
    
    // Try up to 3 times to get a valid translation
    let retryCount = 0;
    let validTranslation = false;
    let bestTranslation = translationText;
    
    while (retryCount < 3 && !validTranslation) {
      retryCount++;
      console.log(`${userLanguage} translation retry attempt ${retryCount}`);
      
      const newTranslation = await getTranslation(originalContent, userLanguage);
      
      // Validate the new translation
      const hasChineseChars = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/.test(newTranslation);
      const hasSubstantialLatinScript = /[a-zA-Z]{4,}/.test(newTranslation);
      
      if (newTranslation && 
          newTranslation !== 'undefined' && 
          newTranslation !== '[object Object]' &&
          newTranslation.length > 10 &&
          hasChineseChars &&
          !hasSubstantialLatinScript) {
        
        bestTranslation = newTranslation;
        validTranslation = true;
        console.log(`Successfully obtained new ${userLanguage} translation:`, {
          length: newTranslation.length,
          preview: newTranslation.substring(0, 30) + '...'
        });
        break;
      }
    }
    
    // Final fallback for Chinese translations
    if (!validTranslation || bestTranslation.length < 10) {
      console.log(`Failed to get proper ${userLanguage} translation after multiple retries`);
      return userLanguage === 'cantonese' 
        ? "翻譯暫時不可用。請諒解不便之處。" 
        : "翻译暂时不可用。请谅解不便之处。";
    }
    
    return bestTranslation;
  }
  
  return translationText;
};
