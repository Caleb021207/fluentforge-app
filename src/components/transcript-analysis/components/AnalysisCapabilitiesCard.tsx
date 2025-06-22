
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

const AnalysisCapabilitiesCard: React.FC = () => {
  const { t } = useLocalization();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("whatOurAiCanAnalyze")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1">
          <li>{t("overallScoresAndCefrLevels")}</li>
          <li>{t("individualSkillBreakdowns")}</li>
          <li>{t("strengthsAndAreasForImprovement")}</li>
          <li>{t("progressTrackingOverTime")}</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AnalysisCapabilitiesCard;
