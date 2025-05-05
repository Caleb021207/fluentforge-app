
import React, { useEffect, useState } from "react";
import TranslationContent from "./TranslationContent";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface TranslationSectionProps {
  showTranslation: boolean;
  role: "user" | "assistant";
  translation: string | Record<string, unknown>;
  currentLanguage: string;
  isTranslationPlaying: boolean;
  isTranslationLoading: boolean;
  onPlayTranslationAudio?: () => void;
}

const TranslationSection: React.FC<TranslationSectionProps> = ({
  showTranslation,
  role,
  translation,
  currentLanguage,
  isTranslationPlaying,
  isTranslationLoading,
  onPlayTranslationAudio
}) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [translationText, setTranslationText] = useState<string>("");
  
  // Debug logging for translations, especially focused on Tagalog
  useEffect(() => {
    if (currentLanguage === 'tagalog') {
      console.log('TranslationSection Tagalog debug:', { 
        originalTranslation: translation,
        translationLength: typeof translation === 'string' ? translation.length : 0,
        translationType: typeof translation
      });
    }
    
    // Sanitize and validate the translation
    const sanitizeTranslation = (): string => {
      // First check for null or undefined
      if (translation === null || translation === undefined) {
        return t("translationNotAvailable", { language: currentLanguage }) || 
               `Translation not available for ${currentLanguage}`;
      }
      
      // Handle string translations
      if (typeof translation === 'string') {
        // Check for empty or invalid string values
        if (!translation.trim() || 
            translation === 'undefined' || 
            translation === '[object Object]') {
          return t("translationNotAvailable", { language: currentLanguage }) || 
                 `Translation not available for ${currentLanguage}`;
        }
        
        // Return valid string translation
        return translation;
      }
      
      // Handle object format translations (seen in Tagalog translations)
      if (typeof translation === 'object' && translation !== null) {
        if (currentLanguage === 'tagalog') {
          console.log('Handling object translation for Tagalog:', translation);
        }
        
        // Safety type conversion for processing
        const translationObj = translation as Record<string, unknown>;
        
        // Try all common object patterns
        if ('value' in translationObj && translationObj.value) {
          const value = String(translationObj.value);
          if (value !== 'undefined' && value !== '[object Object]') {
            return value;
          }
        } 
        
        if ('text' in translationObj && translationObj.text) {
          const text = String(translationObj.text);
          if (text !== 'undefined' && text !== '[object Object]') {
            return text;
          }
        } 
        
        if ('content' in translationObj && translationObj.content) {
          const content = String(translationObj.content);
          if (content !== 'undefined' && content !== '[object Object]') {
            return content;
          }
        }
        
        // Tagalog fallback for object that couldn't be parsed
        if (currentLanguage === 'tagalog') {
          return "Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.";
        }
        
        return t("translationNotAvailable", { language: currentLanguage }) || 
               `Translation not available for ${currentLanguage}`;
      }
      
      // Fallback for any other case
      try {
        const stringValue = String(translation);
        if (stringValue && stringValue !== 'undefined' && stringValue !== '[object Object]') {
          return stringValue;
        }
      } catch (e) {
        console.error('Error converting translation to string:', e);
      }
      
      return t("translationNotAvailable", { language: currentLanguage }) || 
             `Translation not available for ${currentLanguage}`;
    };
    
    // Set the cleaned up translation text
    const sanitizedText = sanitizeTranslation();
    setTranslationText(sanitizedText);
    
    if (currentLanguage === 'tagalog') {
      console.log('Sanitized Tagalog translation:', {
        original: translation,
        sanitized: sanitizedText,
        sanitizedLength: sanitizedText.length
      });
    }
    
  }, [translation, currentLanguage, t]);
  
  if (!showTranslation) {
    return null;
  }
  
  return (
    <div className="border-t border-gray-300 mt-2 pt-2">
      <TranslationContent
        role={role}
        translation={translationText}
        isTranslationPlaying={isTranslationPlaying}
        isTranslationLoading={isTranslationLoading}
        onPlayTranslationAudio={onPlayTranslationAudio}
      />
    </div>
  );
};

export default TranslationSection;
