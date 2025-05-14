
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface PracticePromptButtonProps {
  onClick: () => void;
  isLoading: boolean;
  targetLanguage: string;
}

const PracticePromptButton = ({
  onClick,
  isLoading,
  targetLanguage
}: PracticePromptButtonProps) => {
  const { t } = useLocalization();
  
  // Language display name with proper capitalization
  const displayLanguage = targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1);
  
  return (
    <div className="my-8 text-center">
      <Button 
        onClick={onClick} 
        disabled={isLoading} 
        size="lg" 
        className="bg-primary hover:bg-primary/90"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {t("startConversationIn", { language: displayLanguage })}
      </Button>
      
      <p className="mt-4 text-muted-foreground">
        {t("noticeTextBasedPractice")}
      </p>
    </div>
  );
};

export default PracticePromptButton;
