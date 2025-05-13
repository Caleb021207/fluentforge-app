
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Separator } from "@/components/ui/separator";
import TranslationContent from "./TranslationContent";

interface TranslationSectionProps {
  showTranslation: boolean;
  role: "user" | "assistant";
  translation: string;
  currentLanguage: string;
  isTranslationPlaying: boolean;
  isTranslationLoading: boolean;
  originalContent: string;
  onPlayTranslationAudio?: () => void;
  speechRate?: number;
}

const TranslationSection: React.FC<TranslationSectionProps> = ({
  showTranslation,
  role,
  translation,
  currentLanguage,
  isTranslationPlaying,
  isTranslationLoading,
  originalContent,
  onPlayTranslationAudio,
  speechRate = 1.0
}) => {
  const { t } = useLocalization();
  
  if (!showTranslation || !translation) return null;
  
  // Hide translation if it's identical to original content
  if (translation.trim() === originalContent.trim()) return null;
  
  return (
    <div className="mt-2 pt-2">
      <Separator className="mb-2 opacity-30" />
      <div className="flex flex-col">
        <span className="text-xs mb-1 opacity-70">
          {t("translation")}
        </span>
        <TranslationContent 
          role={role}
          translation={translation}
          isTranslationPlaying={isTranslationPlaying}
          isTranslationLoading={isTranslationLoading}
          onPlayTranslationAudio={onPlayTranslationAudio}
          speechRate={speechRate}
        />
      </div>
    </div>
  );
};

export default TranslationSection;
