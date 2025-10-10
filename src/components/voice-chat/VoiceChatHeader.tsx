
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { VoiceChatHeaderProps } from "@/types/voiceChat";

const VoiceChatHeader: React.FC<VoiceChatHeaderProps> = () => {
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);

  return (
    <div className="mb-10">
      <h1 className="text-5xl font-bold text-foreground mb-6">
        {t("unlimitedVoicePractice")}
      </h1>
      <p className="text-xl text-foreground mb-6">
        {t("practiceDescription")}
      </p>
      <p className="text-base text-muted-foreground mb-2">
        <strong>{t("aiModelInfo")}</strong>
      </p>
    </div>
  );
};

export default VoiceChatHeader;
