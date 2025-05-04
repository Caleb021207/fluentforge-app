
import React from "react";
import TranslationContent from "./TranslationContent";
import { useLocalization } from "@/hooks/useLocalization";

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
  const { t } = useLocalization();
  
  console.log(`TranslationSection rendering with translation: "${translation}" for language: ${currentLanguage}`);
  
  return (
    <div className="border-t border-gray-300 mt-2 pt-2">
      <TranslationContent
        role={role}
        translation={translation || t("translationError", { defaultValue: `Translation not available for ${currentLanguage}` })}
        isTranslationPlaying={isTranslationPlaying}
        isTranslationLoading={isTranslationLoading}
        onPlayTranslationAudio={onPlayTranslationAudio}
      />
    </div>
  );
};

export default TranslationSection;
