
import React, { useEffect, useState } from "react";
import TranslationContent from "./TranslationContent";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import type { TranslationType } from "../hooks/useTranslationHandler";

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
  
  // Process translation on component mount and when translation prop changes
  useEffect(() => {
    if (currentLanguage === 'tagalog' || currentLanguage === 'thai') {
      console.log(`TranslationSection ${currentLanguage} debug:`, { 
        originalTranslation: translation,
        translationLength: typeof translation === 'string' ? translation.length : 0,
        translationType: typeof translation
      });
    }
    
    // Translation should already be a string by this point due to changes in parent components
    if (typeof translation === 'string') {
      setTranslationText(translation);
    } else {
      // Fallback for specific languages
      if (currentLanguage === 'tagalog') {
        setTranslationText("Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.");
      } else if (currentLanguage === 'thai') {
        setTranslationText("ไม่สามารถแสดงคำแปลได้ในขณะนี้ ขออภัยในความไม่สะดวก");
      } else {
        setTranslationText(t("translationNotAvailable", { language: currentLanguage }) || 
               `Translation not available for ${currentLanguage}`);
      }
    }
    
    if (currentLanguage === 'tagalog' || currentLanguage === 'thai') {
      console.log(`Processed ${currentLanguage} translation:`, {
        translationText,
        length: translationText.length
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
