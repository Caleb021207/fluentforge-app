
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { InformationCardProps } from "@/types/voiceChat";

const InformationCard: React.FC<InformationCardProps> = () => {
  const { t } = useLocalization();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("practiceWithVoiceChat")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("useThisTool")}
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{t("askQuestions")}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{t("practiceCommonPhrases")}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{t("describeWhatYouSee")}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{t("practiceVocabularyForSpecific")}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default InformationCard;
