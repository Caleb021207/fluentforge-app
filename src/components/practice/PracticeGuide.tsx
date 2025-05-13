
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

interface PracticeGuideProps {
  targetLanguage: string;
}

const PracticeGuide = ({ targetLanguage }: PracticeGuideProps) => {
  const { t } = useLocalization();
  
  // Get the proper display name for the target language
  const displayLanguage = getLanguageDisplayName(targetLanguage);
  
  return (
    <Card className="mt-8 bg-muted/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t("practiceGuide", { language: displayLanguage })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {t("practiceGuideDescription", { language: displayLanguage })}
        </p>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>{t("practiceTip1")}</li>
          <li>{t("practiceTip2")}</li>
          <li>{t("practiceTip3")}</li>
          <li>{t("practiceTip4")}</li>
          <li>{t("practiceTip5")}</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default PracticeGuide;
