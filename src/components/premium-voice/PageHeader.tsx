
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

interface PageHeaderProps {
  customTitle?: string;
}

const PageHeader = ({ customTitle }: PageHeaderProps) => {
  const { t, currentLanguage } = useLocalization();
  const { practice } = getLanguagePair(currentLanguage);
  
  const title = customTitle || t("premiumVoiceChat");
  
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">
        {t("premiumVoiceChatDescription", { practice })}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {t("premiumVoiceNoteWithReset")}
      </p>
    </div>
  );
};

export default PageHeader;
