
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
    
    // Handle undefined, null, or object translations (common error patterns)
    if (!translation || typeof translation === 'object') {
      // Get the appropriate message from translations if available
      const fallbackMsg = t("translationNotAvailable", { language: currentLanguage }) || 
                         `Translation not available for ${currentLanguage}`;
      setTranslationText(fallbackMsg);
      
      // For Tagalog, show a toast to help debug when in development
      if (currentLanguage === 'tagalog' && process.env.NODE_ENV === 'development') {
        console.error('Invalid Tagalog translation received:', translation);
      }
    } else {
      // Valid translation string
      setTranslationText(translation);
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
