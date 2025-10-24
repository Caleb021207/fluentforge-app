
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

interface PracticePromptButtonProps {
  onClick: () => void;
  isLoading: boolean;
  targetLanguage?: string;
  disabled?: boolean;
}

const PracticePromptButton: React.FC<PracticePromptButtonProps> = ({ 
  onClick, 
  isLoading,
  targetLanguage = "spanish",
  disabled = false
}) => {
  const { t, currentLanguage } = useLocalization();
  
  // Determine which language is being practiced
  const displayLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(targetLanguage)
    : "English";
  
  return (
    <div className="flex justify-center mb-8">
      <Button
        onClick={onClick}
        disabled={isLoading || disabled}
        className="gap-4 text-2xl md:text-3xl px-12 py-8 min-h-[80px] shadow-lg hover:shadow-xl transition-all"
        size="lg"
        variant="success"
      >
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <MessageSquare className="h-8 w-8" />
        )}
        {t("startConversationIn", { language: displayLanguage })}
      </Button>
    </div>
  );
};

export default PracticePromptButton;
