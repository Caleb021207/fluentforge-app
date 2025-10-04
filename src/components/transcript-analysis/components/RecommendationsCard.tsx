
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { Lightbulb } from "lucide-react";

interface RecommendationsCardProps {
  recommendations: string[] | null;
  weaknesses: string[] | null;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations, weaknesses }) => {
  const { t } = useLocalization();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {t("recommendationsForImprovement") || "Recomendaciones para Mejorar"}
        </CardTitle>
        {weaknesses && weaknesses.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {t("basedOnIdentifiedWeaknesses") || "Basado en las áreas de mejora identificadas en tu análisis"}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm leading-relaxed">{rec}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
