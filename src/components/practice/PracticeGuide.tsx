
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
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {t("practiceGuide", { language: learningLanguage })}
      </h2>
      
      <ul className="space-y-3">
        <li className="flex items-start">
          <span className="text-lingua-accent mr-2">•</span>
          <span>{t("practiceGuideItem1")}</span>
        </li>
        <li className="flex items-start">
          <span className="text-lingua-accent mr-2">•</span>
          <span>{t("practiceGuideItem2")}</span>
        </li>
        <li className="flex items-start">
          <span className="text-lingua-accent mr-2">•</span>
          <span>{t("practiceGuideItem3")}</span>
        </li>
        <li className="flex items-start">
          <span className="text-lingua-accent mr-2">•</span>
          <span>{t("practiceGuideItem4")}</span>
        </li>
        <li className="flex items-start">
          <span className="text-lingua-accent mr-2">•</span>
          <span>{t("practiceDisclaimer")}</span>
        </li>
      </ul>
    </Card>
  );
};

export default PracticeGuide;
