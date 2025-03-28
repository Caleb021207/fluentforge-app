
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface RecommendationProps {
  rec: {
    skill: string;
    currentLevel: string;
    lastScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

const RecommendationCard = ({ rec }: RecommendationProps) => {
  const { t } = useLocalization();
  
  // Function to translate skill names
  const translateSkill = (skill: string) => {
    switch(skill.toLowerCase()) {
      case "reading": return t("reading");
      case "writing": return t("writing");
      case "speaking": return t("speaking");
      case "listening": return t("listening");
      default: return skill;
    }
  };

  return (
    <Card key={rec.skill} className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{translateSkill(rec.skill)}</span>
          <div className="flex flex-col items-end">
            <span className="text-sm font-normal">{t("level")}: {rec.currentLevel}</span>
            <span className="text-sm text-gray-500">{t("score")}: {rec.lastScore}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-green-600">
              {t("currentLanguage") === "spanish" ? "Fortalezas" : "Strengths"}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {rec.strengths.map((strength: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-yellow-600">
              {t("currentLanguage") === "spanish" ? "Áreas de Mejora" : "Areas for Improvement"}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {rec.weaknesses.map((weakness: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">{weakness}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-blue-600">
              {t("currentLanguage") === "spanish" ? "Recomendaciones" : "Recommendations"}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {rec.recommendations.map((recommendation: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
