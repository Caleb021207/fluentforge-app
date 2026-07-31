
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
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full gap-3 sm:w-auto [&_svg]:size-5"
      size="xl"
      variant="default"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <MessageSquare />
      )}
      {t("startConversationIn", { language: displayLanguage })}
    </Button>
  );
};

export default PracticePromptButton;
