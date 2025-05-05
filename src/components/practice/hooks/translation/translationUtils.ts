
import { TranslationType } from "./types";

/**
 * Convert any translation format to string
 */
export const extractStringFromTranslation = (translation: TranslationType): string => {
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
