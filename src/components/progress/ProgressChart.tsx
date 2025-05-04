
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import type { ProgressChartProps } from "@/types/chat";

const ProgressChart: React.FC<ProgressChartProps> = ({ progressData }) => {
  const { t } = useLocalization();
  
  if (!progressData || progressData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("learningProgress")}</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">{t("noProgressDataAvailable")}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("learningProgress")}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">{t("progressDataAvailable")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
