
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface RecommendationsCardProps {
  recommendations: string[] | null;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
  const { t } = useLocalization();

  if (!recommendations) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("aiRecommendations")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              {recommendation}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
