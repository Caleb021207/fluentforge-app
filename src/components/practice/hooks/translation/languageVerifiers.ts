
import { TranslationType } from "./types";
import { getTranslation } from "./useTranslationService";

/**
 * Special case for Hindi translations to ensure they use Devanagari script
 */
export const verifyHindiTranslation = async (
  translation: TranslationType, 
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
  translation: TranslationType, 
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
  translation: TranslationType, 
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
export const verifyTagalogTranslation = async (
  translation: TranslationType, 
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

// Helper function to make the circular dependency work
const extractStringFromTranslation = (translation: TranslationType): string => {
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
    
    try {
      const stringified = JSON.stringify(translationObj);
      if (stringified && stringified !== '{}' && stringified !== '[]') {
        if (stringified.startsWith('{') && stringified.endsWith('}')) {
          return stringified.replace(/[{}'"]/g, '').replace(/:/g, ': ');
        }
        return stringified;
      }
    } catch (e) {
      console.error('Failed to stringify translation object:', e);
    }
  }
  
  try {
    return String(translation);
  } catch (e) {
    console.error('Error converting translation to string:', e);
    return "";
  }
};
