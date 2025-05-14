
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const UnauthenticatedAccuracy = () => {
  const { t } = useLocalization();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("accuracyMetrics")}</h1>
          <p className="text-muted-foreground">
            {t("trackYourLanguageProgress")}
          </p>
        </div>
        <div className="bg-secondary/20 p-8 rounded-full">
          <BarChart className="h-8 w-8 text-primary" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("accuracyAnalysis")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center py-8">
          <p className="text-lg">
            {t("signInToViewAccuracyMetrics")}
          </p>
          <p className="text-muted-foreground">
            {t("accuracyMetricsDescription")}
          </p>
          <div className="flex justify-center mt-4">
            <Button variant="default">{t("signIn")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthenticatedAccuracy;
