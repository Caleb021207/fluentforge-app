
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { PracticeInfoPanelProps } from "@/types/voiceChat";

const PracticeInfoPanel: React.FC<PracticeInfoPanelProps> = () => {
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);
  
  // Convert language names to translation keys (e.g., "English" -> "english")
  const nativeKey = native.toLowerCase();
  const practiceKey = practice.toLowerCase();

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">
          {t("practiceLevel")}
        </span> - 
        {t("cefrB1Description")}
      </p>
      <p className="text-sm mt-1">
        <span className="font-medium">
          {t("currentLanguage")}: {t(nativeKey)}
        </span> | 
        <span className="font-medium ml-2">
          {t("practiceLanguage")}: {t(practiceKey)}
        </span>
      </p>
    </div>
  );
};

export default PracticeInfoPanel;
