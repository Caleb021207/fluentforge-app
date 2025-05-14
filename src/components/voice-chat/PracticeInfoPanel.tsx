
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

const PracticeInfoPanel: React.FC = () => {
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);

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
          {t("currentLanguage")}: {native}
        </span> | 
        <span className="font-medium ml-2">
          {t("practiceLanguage")}: {practice}
        </span>
      </p>
    </div>
  );
};

export default PracticeInfoPanel;
