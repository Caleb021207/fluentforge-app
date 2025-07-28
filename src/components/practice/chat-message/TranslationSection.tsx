import React, { useEffect, useState } from "react";
import TranslationContent from "./TranslationContent";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TranslationType } from "../hooks/useTranslationHandler";

interface TranslationSectionProps {
  showTranslation: boolean;
  role: "user" | "assistant";
  translation: string;
  currentLanguage: string;
  isTranslationPlaying: boolean;
  isTranslationLoading: boolean;
  originalContent: string; // Original content to compare with translation
  onPlayTranslationAudio?: () => void;
}

const TranslationSection: React.FC<TranslationSectionProps> = ({
  showTranslation,
  role,
  translation,
  currentLanguage,
  isTranslationPlaying,
  isTranslationLoading,
  originalContent,
  onPlayTranslationAudio
}) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [translationText, setTranslationText] = useState<string>("");
  const [shouldDisplay, setShouldDisplay] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Process translation on component mount and when translation prop changes
  useEffect(() => {
    if (currentLanguage.toLowerCase() === 'tagalog' || currentLanguage.toLowerCase() === 'thai') {
      console.log(`TranslationSection ${currentLanguage} debug:`, { 
        originalTranslation: translation,
        originalContent,
        translationLength: typeof translation === 'string' ? translation.length : 0,
        translationType: typeof translation,
        areEqual: translation.trim() === originalContent.trim()
      });
    }
    
    // More robust comparison - normalize text by removing extra spaces and making lowercase
    const normalizedTranslation = translation.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedContent = originalContent.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Check if we should display this translation (avoid duplicating content)
    const isTranslationSameAsContent = normalizedTranslation === normalizedContent || normalizedTranslation === '';
    
    // Special debug for Thai
    if (currentLanguage.toLowerCase() === 'thai') {
      console.log('Thai translation comparison:', {
        normalizedTranslation,
        normalizedContent,
        isTranslationSameAsContent,
        containsThaiScript: /[\u0E00-\u0E7F]/.test(translation)
      });
      
      // Force display for Thai if it contains Thai script
      if (/[\u0E00-\u0E7F]/.test(translation)) {
        setShouldDisplay(true);
      } else {
        setShouldDisplay(!isTranslationSameAsContent);
      }
    } else {
      setShouldDisplay(!isTranslationSameAsContent);
    }
    
    // Translation should already be a string by this point due to changes in parent components
    if (typeof translation === 'string' && translation.trim() !== '') {
      setTranslationText(translation);
    } else {
      // Fallback for specific languages
      if (currentLanguage.toLowerCase() === 'tagalog') {
        setTranslationText("Hindi magagamit ang pagsasalin sa ngayon. Paumanhin sa abala.");
      } else if (currentLanguage.toLowerCase() === 'thai') {
        setTranslationText("ไม่สามารถแสดงคำแปลได้ในขณะนี้ ขออภัยในความไม่สะดวก");
      } else {
        setTranslationText(t("translationNotAvailable", { language: currentLanguage }) || 
               `Translation not available for ${currentLanguage}`);
      }
    }
    
    if (currentLanguage.toLowerCase() === 'tagalog' || currentLanguage.toLowerCase() === 'thai') {
      console.log(`Processed ${currentLanguage} translation:`, {
        translationText,
        shouldDisplay,
        length: translationText.length
      });
    }
  }, [translation, currentLanguage, t, originalContent]);
  
  if (!showTranslation || !shouldDisplay) {
    return null;
  }
  
  return (
    <div className="border-t border-border mt-2 pt-2">
      {/* Translation toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-full justify-start"
      >
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span>{isExpanded ? t("hideTranslation") : t("showTranslation")}</span>
      </button>
      
      {/* Translation content - only shown when expanded */}
      {isExpanded && (
        <TranslationContent
          role={role}
          translation={translationText}
          isTranslationPlaying={isTranslationPlaying}
          isTranslationLoading={isTranslationLoading}
          onPlayTranslationAudio={onPlayTranslationAudio}
        />
      )}
    </div>
  );
};

export default TranslationSection;
