
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";
import { VoiceChatHeaderProps } from "@/types/voiceChat";

const VoiceChatHeader: React.FC<VoiceChatHeaderProps> = () => {
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);

  return (
    <div className="mb-10 text-center">
      <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
        {t("unlimitedVoicePractice")}
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-6">
        {t("practiceDescription")}
      </p>
      <p className="text-lg md:text-xl text-muted-foreground">
        <strong>{t("aiModelInfo")}</strong>
      </p>
    </div>
  );
};

export default VoiceChatHeader;
