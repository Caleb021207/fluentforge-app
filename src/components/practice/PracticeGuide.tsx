
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
  const learningLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(targetLanguage) 
    : "English";
  
  // Special case for Tagalog to use specific Tagalog translations
  const isTagalog = currentLanguage === "tagalog";
  
  const practiceTips = [
    isTagalog ? "Subukang bumuo ng kumpletong mga pangungusap, kahit na simple lang." : t("practiceTip1"),
    isTagalog ? "Huwag mag-alala sa pagkakamali — bahagi iyan ng pagkatuto!" : t("practiceTip2"),
    isTagalog ? "Humingi ng paliwanag kung may bagay kang hindi naiintindihan." : t("practiceTip3"),
    isTagalog ? "Gamitin ang mga salitang bagong natutunan mo." : t("practiceTip4"),
    isTagalog ? "Aangkop ang aming AI sa iyong antas ng kasanayan at unti-unting tutulong sa iyo na umunlad." : t("practiceTip5")
  ];
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isTagalog ? "Gabay sa Pagsasanay sa Ingles" : `${learningLanguage} ${t("practiceGuide")}`}
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
