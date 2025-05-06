
/**
 * Special case verifiers for different languages to ensure they use the correct script
 */

import { getTranslation } from "./useTranslationService";
import { extractStringFromTranslation } from "./translationUtils";

/**
 * Special case for Hindi translations to ensure they use Devanagari script
 */
export const verifyHindiTranslation = async (
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
export const verifyFarsiTranslation = async (
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
export const verifyBengaliTranslation = async (
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
 * Special case handling for Tagalog translations
 */
export const verifyTagalogTranslation = async (
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
 * Special case for Chinese translations (both Mandarin and Cantonese)
 * to ensure they use proper Chinese characters
 */
export const verifyChineseTranslation = async (
  translation: string | Record<string, unknown>, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'mandarin' && userLanguage !== 'cantonese') 
    return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  console.log(`Verifying ${userLanguage} translation:`, {
    hasTranslation: !!translationText,
    translationLength: translationText ? translationText.length : 0,
    shortContentPreview: originalContent.substring(0, 30) + '...'
  });
  
  // Check if the translation contains Chinese characters
  const containsChinese = /[\u4E00-\u9FFF]/.test(translationText);
  
  if (!containsChinese || 
      translationText === 'undefined' || 
      translationText === '[object Object]' ||
      translationText.length < 10) {
    
    console.log(`Getting proper ${userLanguage} translation with Chinese characters`);
    
    // Try up to 3 times to get a valid translation
    let retryCount = 0;
    let validTranslation = false;
    let bestTranslation = translationText;
    
    while (retryCount < 3 && !validTranslation) {
      retryCount++;
      console.log(`${userLanguage} translation retry attempt ${retryCount}`);
      
      const newTranslation = await getTranslation(originalContent, userLanguage);
      
      // Check if contains Chinese characters and is long enough
      if (newTranslation && 
          /[\u4E00-\u9FFF]/.test(newTranslation) &&
          newTranslation !== 'undefined' && 
          newTranslation !== '[object Object]' &&
          newTranslation.length > 10) {
        
        bestTranslation = newTranslation;
        validTranslation = true;
        console.log(`Successfully obtained new ${userLanguage} translation:`, {
          length: newTranslation.length,
          preview: newTranslation.substring(0, 30) + '...'
        });
        break;
      }
    }
    
    // Final fallback
    if (!validTranslation && bestTranslation.length < 10) {
      console.log(`Failed to get proper ${userLanguage} translation after multiple retries`);
      return userLanguage === 'cantonese' 
        ? "翻譯暫時不可用。請諒解不便之處。" 
        : "翻译暂时不可用。请谅解不便之处。";
    }
    
    return bestTranslation;
  }
  
  return translationText;
};
