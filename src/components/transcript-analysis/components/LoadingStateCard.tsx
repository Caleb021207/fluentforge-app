
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

const LoadingStateCard: React.FC = () => {
  const { t } = useLocalization();

  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>{t("loading")}</p>
      </CardContent>
    </Card>
  );
};

export default LoadingStateCard;
