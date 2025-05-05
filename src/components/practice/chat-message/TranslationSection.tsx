
import React from "react";
import TranslationContent from "./TranslationContent";

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
  role,
  translation,
  currentLanguage,
  isTranslationPlaying,
  isTranslationLoading,
  onPlayTranslationAudio
}) => {
  // Add debug logging specifically for Tagalog
  if (currentLanguage === 'tagalog') {
    console.log('TranslationSection Tagalog debug:', { 
      translation, 
      translationLength: translation ? translation.length : 0,
      hasDefaultMessage: translation.includes('Translation not available')
    });
  }
  
  // Improve translation fallback message to be more specific
  const translationText = translation || `Translation not available for ${currentLanguage}`;
  
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
