
import React from "react";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface PracticePromptButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const PracticePromptButton: React.FC<PracticePromptButtonProps> = ({ onClick, isLoading }) => {
  const { t, currentLanguage } = useLocalization();

  return (
    <div className="flex justify-center mb-8">
      <Button onClick={onClick} disabled={isLoading} className="bg-lingua-primary w-full sm:w-auto">
        <Book className="h-4 w-4 mr-2" />
        {t("sendEnglishPracticePrompt")}
      </Button>
    </div>
  );
};

export default PracticePromptButton;
