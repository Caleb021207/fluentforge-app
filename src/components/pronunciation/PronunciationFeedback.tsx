
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PronunciationAnalysisResult } from "@/utils/pronunciationUtils";

interface PronunciationFeedbackProps {
  feedback: PronunciationAnalysisResult;
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
        {/* Accuracy Score */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">{t("accuracyScore")}</span>
            <span className="text-sm font-medium">{Math.round(feedback.accuracyScore)}%</span>
          </div>
          <Progress value={feedback.accuracyScore} className="h-2" />
        </div>
        
        {/* Word Analysis */}
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
                {item.isCorrect ? (
                  item.word
                ) : (
                  <span>
                    <span className="line-through opacity-60">{item.word}</span>
                    <span className="ml-1 text-xs">({item.suggestion})</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Phoneme Analysis (if available) */}
        {feedback.phonemeAnalysis && feedback.phonemeAnalysis.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("phonemeAnalysis")}</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.phonemeAnalysis.map((item, index) => (
                <div 
                  key={`${item.phoneme}-${index}`}
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.isCorrect 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                  title={item.suggestion || ""}
                >
                  {item.phoneme}
                  {!item.isCorrect && item.suggestion && (
                    <span className="ml-1 opacity-70">→ {item.suggestion}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Overall Feedback */}
        <div>
          <h4 className="text-sm font-medium mb-1">{t("overallFeedback")}</h4>
          <p className="text-sm">{feedback.overallFeedback}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PronunciationFeedback;
