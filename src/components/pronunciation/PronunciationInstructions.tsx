
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const PronunciationInstructions = () => {
  const { t } = useLocalization();

  const tips = [
    t("listenCarefullyTip"),
    t("payAttentionToStressTip"),
    t("practiceDifficultSoundsTip"),
    t("recordYourselfTip"),
    t("bePatientTip")
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pronunciationPracticeTips")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PronunciationInstructions;
