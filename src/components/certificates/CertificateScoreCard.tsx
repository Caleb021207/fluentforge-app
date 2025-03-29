
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { determineLevel, ensureValidScore } from "@/components/certifications/utils/scoreUtils";
import { CertificationAttempt } from "@/types/supabase";
import { Award, MessageSquare } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface CertificateScoreCardProps {
  type: string;
  attempt: CertificationAttempt | undefined;
}

const CertificateScoreCard = ({ type, attempt }: CertificateScoreCardProps) => {
  const { t, currentLanguage } = useLocalization();

  const formatType = (type: string) => {
    if (type === "conversation" || type === "fluency") {
      return t("conversationalFluency");
    }
    
    switch(type) {
      case "reading": return t("reading");
      case "writing": return t("writing");
      case "speaking": return t("speaking");
      case "listening": return t("listening");
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getIcon = () => {
    if (type === "conversation" || type === "fluency") {
      return <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />;
    }
    return <Award className="h-4 w-4 text-blue-500 mr-2" />;
  };

  // Make sure we have a valid score value
  const getScore = () => {
    if (!attempt || attempt.score === undefined || attempt.score === null) {
      return 0;
    }
    return ensureValidScore(attempt.score);
  };

  const score = getScore();
  
  const getProgressColor = (score: number): string => {
    if (score >= 88) return "bg-green-500"; // C1-C2
    if (score >= 78) return "bg-blue-500";  // B2
    if (score >= 65) return "bg-blue-400";  // B1
    if (score >= 50) return "bg-yellow-500"; // A2
    return "bg-gray-400"; // A1 or lower
  };
  
  // Updated to properly detect complete fluency tests
  const isComplete = (attempt?: CertificationAttempt) => {
    if (!attempt) return false;
    
    if (attempt.certification_type === 'fluency' || attempt.certification_type === 'conversation') {
      return attempt.score > 0;
    }
    
    return attempt.completed_at != null && attempt.score > 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">{getIcon()} {formatType(type)}</CardTitle>
      </CardHeader>
      <CardContent>
        {attempt && isComplete(attempt) ? (
          <>
            <Progress 
              value={score} 
              className="mb-2" 
              indicatorClassName={getProgressColor(score)}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t("score")}: {score}%</span>
              <span>{t("level")}: {determineLevel(score)}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">
            {currentLanguage === "spanish" 
              ? "Aún no hay intentos completados" 
              : "No completed attempts yet"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateScoreCard;
