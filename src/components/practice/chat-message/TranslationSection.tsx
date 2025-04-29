
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
  showTranslation,
  role,
  translation,
  currentLanguage,
  isTranslationPlaying,
  isTranslationLoading,
  onPlayTranslationAudio
}) => {
  if (!showTranslation) {
    return null;
  }

  return (
    <div className="border-t border-gray-300 mt-2 pt-2">
      <TranslationContent
        role={role}
        translation={translation || `Translation not available for ${currentLanguage}`}
        isTranslationPlaying={isTranslationPlaying}
        isTranslationLoading={isTranslationLoading}
        onPlayTranslationAudio={onPlayTranslationAudio}
      />
    </div>
  );
};

export default TranslationSection;
