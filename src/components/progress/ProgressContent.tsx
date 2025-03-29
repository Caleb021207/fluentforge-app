
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressChart from "./ProgressChart";
import RecommendationCard from "./RecommendationCard";
import RecentAttemptsCard from "./RecentAttemptsCard";
import NoProgressCard from "./NoProgressCard";
import { useLocalization } from "@/context/LocalizationContext";

interface ProgressContentProps {
  progressData: any[];
  recommendations: any[];
  normalizedAttempts: any[];
  hasTranscript: Record<string, boolean>;
  onViewAttempt: (attemptId: string) => void;
}

const ProgressContent = ({ 
  progressData, 
  recommendations, 
  normalizedAttempts, 
  hasTranscript, 
  onViewAttempt 
}: ProgressContentProps) => {
  const { t } = useLocalization();

  if (progressData.length === 0) {
    return <NoProgressCard />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("scoreTrends")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart progressData={progressData} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} rec={rec} />
        ))}
      </div>

      <RecentAttemptsCard 
        attempts={normalizedAttempts} 
        hasTranscript={hasTranscript} 
        onViewAttempt={onViewAttempt} 
      />
    </>
  );
};

export default ProgressContent;
