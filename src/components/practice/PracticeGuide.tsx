
import React from "react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

interface PracticeGuideProps {
  targetLanguage: string;
}

const PracticeGuide: React.FC<PracticeGuideProps> = ({ targetLanguage }) => {
  const { currentLanguage, t } = useLocalization();
  
  // Get localized target language name
  const learningLanguage = getLanguageDisplayName(targetLanguage);
  
  // Use localized practice tips instead of hardcoded ones
  const practiceTips = [
    t("practiceTip1"),
    t("practiceTip2"),
    t("practiceTip3"),
    t("practiceTip4"),
    t("practiceTip5")
  ];
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {t("practiceGuide", { language: learningLanguage })}
      </h2>
      
      <ul className="space-y-3">
        {practiceTips.map((tip, index) => (
          <li key={index} className="flex items-start">
            <span className="text-lingua-primary mr-2">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default PracticeGuide;
