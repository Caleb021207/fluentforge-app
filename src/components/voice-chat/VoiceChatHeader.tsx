
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

const VoiceChatHeader = () => {
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {t("unlimitedVoicePractice")}
      </h1>
      <p className="text-foreground mb-4">
        {t("practiceDescription")}
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        <strong>{t("aiModelInfo")}</strong>
      </p>
    </div>
  );
};

export default VoiceChatHeader;
