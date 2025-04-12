
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
  
  // Customize button text for English speakers learning French
  if (currentLanguage === "english" && targetLanguage === "french") {
    return (
      <div className="flex justify-center mb-8">
        <Button
          onClick={onClick}
          disabled={isLoading || disabled}
          className="gap-2"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          Start French Conversation
        </Button>
      </div>
    );
  }
  
  // Default button for other language combinations
  return (
    <div className="flex justify-center mb-8">
      <Button
        onClick={onClick}
        disabled={isLoading || disabled}
        className="gap-2"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
        {t("startConversationIn", { language: displayLanguage })}
      </Button>
    </div>
  );
};

export default PracticePromptButton;
