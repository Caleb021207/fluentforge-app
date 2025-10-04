
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface RecommendationsCardProps {
  recommendations: string[] | null;
  weaknesses: string[] | null;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations, weaknesses }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommendations for Improvement
        </CardTitle>
        {weaknesses && weaknesses.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Based on the areas for improvement identified in your analysis
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm leading-relaxed break-words whitespace-normal">{rec}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
