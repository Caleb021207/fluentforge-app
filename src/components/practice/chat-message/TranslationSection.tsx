
import React, { useEffect, useState } from "react";
import TranslationContent from "./TranslationContent";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface TranslationSectionProps {
  showTranslation: boolean;
  role: "user" | "assistant";
  translation: string;
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
        translation, 
        translationLength: translation ? translation.length : 0,
        hasDefaultMessage: translation?.includes('Translation not available') || false,
        translationType: typeof translation,
        currentLanguage
      });
    }
    
    // Sanitize and validate the translation
    const sanitizeTranslation = (): string => {
      // Handle undefined, null, empty strings, or object translations
      if (!translation) {
        return t("translationNotAvailable", { language: currentLanguage }) || 
                `Translation not available for ${currentLanguage}`;
      }
      
      // Handle possible object formats (common error for Tagalog)
      if (typeof translation === 'object') {
        console.warn(`Received object instead of string for ${currentLanguage} translation:`, translation);
        
        // Try to extract string from common object patterns
        if ('value' in translation && translation.value) {
          return String(translation.value);
        } else if ('text' in translation && translation.text) {
          return String(translation.text);
        } else if ('content' in translation && translation.content) {
          return String(translation.content);
        } else {
          return t("translationNotAvailable", { language: currentLanguage }) || 
                 `Translation not available for ${currentLanguage}`;
        }
      }
      
      // Handle invalid string values like 'undefined', '[object Object]'
      if (translation === 'undefined' || translation === '[object Object]') {
        return t("translationNotAvailable", { language: currentLanguage }) || 
               `Translation not available for ${currentLanguage}`;
      }
      
      // If it's a valid string and not a default message, return it
      return translation;
    };
    
    // Set the cleaned up translation text
    setTranslationText(sanitizeTranslation());
    
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
