import { getTranslation } from "./useTranslationService";
import { TranslationType } from "./types";
import { extractStringFromTranslation } from "./translationUtils";

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
 * Special case for Tagalog translations
 */
export const verifyTagalogTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'tagalog') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Ensure Tagalog translation is valid
  if (!translationText || 
      translationText === 'undefined' || 
      translationText === '[object Object]' ||
      translationText.length < 10 || 
      translationText.includes('Translation not available')) {
    
    console.log('Getting proper Tagalog translation - inadequate translation detected');
    return await getTranslation(originalContent, 'tagalog');
  }
  
  return translationText;
};

/**
 * Special case for Chinese translations (both Mandarin and Cantonese)
 */
export const verifyChineseTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'mandarin' && userLanguage !== 'cantonese') 
    return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Chinese characters
  const containsChinese = /[\u4E00-\u9FFF]/.test(translationText);
  
  if (!containsChinese) {
    console.log(`Getting proper ${userLanguage} translation with Chinese characters`);
    return await getTranslation(originalContent, userLanguage);
  }
  
  return translationText;
};

/**
 * Special case for Thai translations to ensure they use proper Thai script
 */
export const verifyThaiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'thai') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  console.log('Verifying Thai translation:', {
    translationText: translationText.substring(0, 30) + '...',
    originalContent: originalContent.substring(0, 30) + '...',
    translationLength: translationText.length,
    containsThai: /[\u0E00-\u0E7F]/.test(translationText),
    isSameAsContent: translationText.trim() === originalContent.trim()
  });
  
  // First check if translation contains Thai script
  const containsThai = /[\u0E00-\u0E7F]/.test(translationText);
  
  // Also check if the translation is the same as the original content
  const isSameAsContent = translationText.trim() === originalContent.trim();
  
  if (!containsThai || isSameAsContent) {
    console.log('Getting proper Thai translation - inadequate translation detected');
    
    // Try up to 3 times to get a valid translation
    let retryCount = 0;
    let validTranslation = false;
    let bestTranslation = "ไม่สามารถแสดงคำแปลได้ในขณะนี้ ขออภัยในความไม่สะดวก";
    
    while (retryCount < 3 && !validTranslation) {
      retryCount++;
      console.log(`Thai translation retry attempt ${retryCount}`);
      
      const newTranslation = await getTranslation(originalContent, 'thai');
      
      // Check if it contains Thai script
      if (newTranslation && 
          /[\u0E00-\u0E7F]/.test(newTranslation) && 
          newTranslation.trim() !== originalContent.trim()) {
        
        bestTranslation = newTranslation;
        validTranslation = true;
        console.log('Successfully obtained new Thai translation with Thai script:', {
          length: newTranslation.length,
          preview: newTranslation.substring(0, 30) + '...'
        });
        break;
      }
    }
    
    return bestTranslation;
  }
  
  return translationText;
};

/**
 * Special case for Burmese translations to ensure they use proper Burmese script
 */
export const verifyBurmeseTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'burmese') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Burmese script
  const containsBurmese = /[\u1000-\u109F]/.test(translationText);
  
  if (!containsBurmese) {
    console.log('Getting proper Burmese translation with Burmese script');
    return await getTranslation(originalContent, 'burmese');
  }
  
  return translationText;
};

/**
 * Special case for Karen translations to ensure they use proper Karen script
 */
export const verifyKarenTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'karen') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Karen often uses Burmese script
  const containsKaren = /[\u1000-\u109F]/.test(translationText);
  
  if (!containsKaren) {
    console.log('Getting proper Karen translation with Karen script');
    return await getTranslation(originalContent, 'karen');
  }
  
  return translationText;
};

/**
 * Special case for Nepali translations to ensure they use proper Devanagari script
 */
export const verifyNepaliTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'nepali') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Nepali uses Devanagari script
  const containsDevanagari = /[\u0900-\u097F]/.test(translationText);
  
  if (!containsDevanagari) {
    console.log('Getting proper Nepali translation with Devanagari script');
    return await getTranslation(originalContent, 'nepali');
  }
  
  return translationText;
};

/**
 * Special case for Tigrinya translations to ensure they use proper Ge'ez script
 */
export const verifyTigrinyaTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'tigrinya') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Tigrinya uses Ge'ez script
  const containsGeez = /[\u1200-\u137F]/.test(translationText);
  
  if (!containsGeez) {
    console.log('Getting proper Tigrinya translation with Ge\'ez script');
    return await getTranslation(originalContent, 'tigrinya');
  }
  
  return translationText;
};

/**
 * Special case for Punjabi translations to ensure they use proper Gurmukhi script
 */
export const verifyPunjabiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'punjabi') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Punjabi uses Gurmukhi script
  const containsGurmukhi = /[\u0A00-\u0A7F]/.test(translationText);
  
  if (!containsGurmukhi) {
    console.log('Getting proper Punjabi translation with Gurmukhi script');
    return await getTranslation(originalContent, 'punjabi');
  }
  
  return translationText;
};

/**
 * Special case for Marathi translations to ensure they use proper Devanagari script
 */
export const verifyMarathiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'marathi') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Marathi uses Devanagari script
  const containsDevanagari = /[\u0900-\u097F]/.test(translationText);
  
  if (!containsDevanagari) {
    console.log('Getting proper Marathi translation with Devanagari script');
    return await getTranslation(originalContent, 'marathi');
  }
  
  return translationText;
};

/**
 * Special case for Gujarati translations to ensure they use proper Gujarati script
 */
export const verifyGujaratiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'gujarati') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Gujarati uses Gujarati script
  const containsGujarati = /[\u0A80-\u0AFF]/.test(translationText);
  
  if (!containsGujarati) {
    console.log('Getting proper Gujarati translation with Gujarati script');
    return await getTranslation(originalContent, 'gujarati');
  }
  
  return translationText;
};

/**
 * Special case for Sinhala translations to ensure they use proper Sinhala script
 */
export const verifySinhalaTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'sinhala') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Sinhala uses Sinhala script
  const containsSinhala = /[\u0D80-\u0DFF]/.test(translationText);
  
  if (!containsSinhala) {
    console.log('Getting proper Sinhala translation with Sinhala script');
    return await getTranslation(originalContent, 'sinhala');
  }
  
  return translationText;
};
