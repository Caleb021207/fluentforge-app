
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
  
  // Check for valid Tagalog translation
  if (!translationText || 
      translationText === 'undefined' || 
      translationText === '[object Object]' ||
      translationText.length < 10 || 
      translationText.includes('Translation not available')) {
    
    console.log('Getting proper Tagalog translation - inadequate translation detected');
    return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
  }
  
  return translationText;
};

/**
 * Special case for Mandarin/Cantonese translations to ensure proper Chinese script
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
 * Special case for Thai translations to ensure proper Thai script
 */
export const verifyThaiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'thai') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Thai script
  const containsThai = /[\u0E00-\u0E7F]/.test(translationText);
  
  if (!containsThai) {
    console.log('Getting proper Thai translation with Thai script');
    return await getTranslation(originalContent, 'thai');
  }
  
  return translationText;
};

/**
 * Special case for Burmese translations to ensure proper Burmese script
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
 * Special case for Karen translations to ensure proper Karen script
 */
export const verifyKarenTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'karen') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Karen script (uses Myanmar Unicode range)
  const containsKaren = /[\u1000-\u109F]/.test(translationText);
  
  if (!containsKaren) {
    console.log('Getting proper Karen translation with Karen script');
    return await getTranslation(originalContent, 'karen');
  }
  
  return translationText;
};

/**
 * Special case for Nepali translations to ensure proper Nepali script
 */
export const verifyNepaliTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'nepali') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Devanagari script (used in Nepali)
  const containsDevanagari = /[\u0900-\u097F]/.test(translationText);
  
  if (!containsDevanagari) {
    console.log('Getting proper Nepali translation with Devanagari script');
    return await getTranslation(originalContent, 'nepali');
  }
  
  return translationText;
};

/**
 * Special case for Tigrinya translations to ensure proper Tigrinya script
 */
export const verifyTigrinyaTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'tigrinya') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Ethiopic script (used in Tigrinya)
  const containsEthiopic = /[\u1200-\u137F]/.test(translationText);
  
  if (!containsEthiopic) {
    console.log('Getting proper Tigrinya translation with Ethiopic script');
    return await getTranslation(originalContent, 'tigrinya');
  }
  
  return translationText;
};

/**
 * Special case for Punjabi translations to ensure proper Punjabi script
 */
export const verifyPunjabiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'punjabi') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Gurmukhi script (used in Punjabi)
  const containsGurmukhi = /[\u0A00-\u0A7F]/.test(translationText);
  
  if (!containsGurmukhi) {
    console.log('Getting proper Punjabi translation with Gurmukhi script');
    return await getTranslation(originalContent, 'punjabi');
  }
  
  return translationText;
};

/**
 * Special case for Marathi translations to ensure proper Marathi script
 */
export const verifyMarathiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'marathi') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Devanagari script (used in Marathi)
  const containsDevanagari = /[\u0900-\u097F]/.test(translationText);
  
  if (!containsDevanagari) {
    console.log('Getting proper Marathi translation with Devanagari script');
    return await getTranslation(originalContent, 'marathi');
  }
  
  return translationText;
};

/**
 * Special case for Gujarati translations to ensure proper Gujarati script
 */
export const verifyGujaratiTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'gujarati') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Gujarati script
  const containsGujarati = /[\u0A80-\u0AFF]/.test(translationText);
  
  if (!containsGujarati) {
    console.log('Getting proper Gujarati translation with Gujarati script');
    return await getTranslation(originalContent, 'gujarati');
  }
  
  return translationText;
};

/**
 * Special case for Sinhala translations to ensure proper Sinhala script
 */
export const verifySinhalaTranslation = async (
  translation: TranslationType, 
  originalContent: string,
  userLanguage: string
): Promise<string> => {
  if (userLanguage !== 'sinhala') return extractStringFromTranslation(translation);
  
  // Extract string if needed
  const translationText = extractStringFromTranslation(translation);
  
  // Check if the translation contains Sinhala script
  const containsSinhala = /[\u0D80-\u0DFF]/.test(translationText);
  
  if (!containsSinhala) {
    console.log('Getting proper Sinhala translation with Sinhala script');
    return await getTranslation(originalContent, 'sinhala');
  }
  
  return translationText;
};
