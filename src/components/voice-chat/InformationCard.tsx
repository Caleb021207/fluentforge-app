import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
const InformationCard: React.FC = () => {
  const {
    t
  } = useLocalization();
  return <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t("practiceWithVoiceChat")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground mb-6">
          {t("voiceChatTips")}
        </p>
        <ul className="space-y-3 text-base">
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
            <span className="text-left">{t("voiceTip4")}</span>
          </li>
        </ul>
      </CardContent>
    </Card>;
};
export default InformationCard;