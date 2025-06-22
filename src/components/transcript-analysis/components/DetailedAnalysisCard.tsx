
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface DetailedAnalysisCardProps {
  feedback: string;
}

const DetailedAnalysisCard: React.FC<DetailedAnalysisCardProps> = ({ feedback }) => {
  const { t } = useLocalization();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("detailedAnalysis")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{feedback}</p>
      </CardContent>
    </Card>
  );
};

export default DetailedAnalysisCard;
