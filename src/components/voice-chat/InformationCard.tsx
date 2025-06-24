
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

const InformationCard: React.FC = () => {
  const { t } = useLocalization();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("practiceWithVoiceChat")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("voiceChatTips")}
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>{t("voiceTip1")}</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>{t("voiceTip2")}</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>{t("voiceTip3")}</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>{t("voiceTip4")}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default InformationCard;
