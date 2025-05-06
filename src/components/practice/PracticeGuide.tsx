
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
  
  return (
    <Card className="p-6 border border-border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        {t("practiceGuide", { language: learningLanguage })}
      </h2>
      
      {/* Add the description text */}
      <p className="mb-4 text-foreground">
        {t("practiceGuideDescription", { language: learningLanguage })}
      </p>
      
      <ul className="space-y-3">
        {[
          t("practiceTip1"),
          t("practiceTip2"),
          t("practiceTip3"),
          t("practiceTip4"),
          t("practiceTip5")
        ].map((tip, index) => (
          <li key={index} className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span className="text-foreground">{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default PracticeGuide;
