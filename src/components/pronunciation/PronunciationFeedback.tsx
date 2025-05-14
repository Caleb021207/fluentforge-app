
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WordFeedback {
  word: string;
  isCorrect: boolean;
  suggestion?: string;
}

interface PronunciationFeedbackData {
  accuracyScore: number;
  wordAnalysis: WordFeedback[];
  overallFeedback: string;
}

interface PronunciationFeedbackProps {
  feedback: PronunciationFeedbackData;
}

const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({ feedback }) => {
  const { t } = useLocalization();

  // Helper function to get score color class
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };
  
  // Helper function to get score text
  const getScoreText = (score: number) => {
    if (score >= 80) return t("excellent");
    if (score >= 60) return t("good");
    if (score >= 40) return t("fair");
    return t("needsImprovement");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{t("pronunciationFeedback")}</span>
          <span className={getScoreColorClass(feedback.accuracyScore)}>
            {Math.round(feedback.accuracyScore)}% - {getScoreText(feedback.accuracyScore)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">{t("accuracyScore")}</span>
            <span className="text-sm font-medium">{Math.round(feedback.accuracyScore)}%</span>
          </div>
          <Progress value={feedback.accuracyScore} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t("wordAnalysis")}</h4>
          <div className="flex flex-wrap gap-2">
            {feedback.wordAnalysis.map((item, index) => (
              <div 
                key={`${item.word}-${index}`}
                className={`px-3 py-1 rounded-full text-sm ${
                  item.isCorrect 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
                title={item.suggestion || ""}
              >
                {item.word}
                {!item.isCorrect && item.suggestion && (
                  <span className="ml-1 opacity-70">→ {item.suggestion}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">{t("overallFeedback")}</h4>
          <p className="text-sm">{feedback.overallFeedback}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PronunciationFeedback;
