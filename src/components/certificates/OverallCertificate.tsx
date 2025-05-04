
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CertificationAttempt } from "@/types/supabase";
import CEFRLevelRubric from "./CEFRLevelRubric";
import CEFRLevelDescriptions from "./CEFRLevelDescriptions";
import { useLocalization } from "@/context/LocalizationContext";

interface OverallCertificateProps {
  compositeScore: {
    score: number;
    level: string;
  } | null;
}

const OverallCertificate = ({ compositeScore }: OverallCertificateProps) => {
  const { t, currentLanguage } = useLocalization();
  
  if (!compositeScore) return null;

  // Function to get description based on language
  const getLocalizedDescription = () => {
    if (currentLanguage === "spanish") {
      return "Este certificado representa tu nivel actual de competencia en inglés basado en tus puntuaciones más altas en las cuatro habilidades: lectura, escritura, expresión oral y comprensión auditiva.";
    } else if (currentLanguage === "portuguese") {
      return "Este certificado representa seu nível atual de proficiência em inglês com base em suas pontuações mais altas nas quatro habilidades: leitura, escrita, fala e compreensão auditiva.";
    } else {
      return "This certificate represents your current Spanish language proficiency level based on your highest test scores across all four skills: reading, writing, speaking, and listening.";
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle>{t("overallCertificate")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-blue-900">
            {t("level")} {compositeScore.level}
          </h2>
          <p className="text-gray-600">
            {t("overallLevel")}: {compositeScore.score}%
          </p>
          <div className="p-4 border rounded-lg bg-white">
            <p className="text-sm text-gray-600">
              {getLocalizedDescription()}
            </p>
          </div>
        </div>
        <Progress value={compositeScore.score} className="h-2" />
        
        <CEFRLevelRubric />
        <CEFRLevelDescriptions />
      </CardContent>
    </Card>
  );
};

export default OverallCertificate;
