
import React from "react";
import { TranscriptAssessment } from "../utils/assessmentUtils";
import { Progress } from "@/components/ui/progress";

interface DetailedScoresProps {
  assessment: TranscriptAssessment;
}

const DetailedScores = ({ assessment }: DetailedScoresProps) => {
  const categories = [
    { name: "Fluency", score: assessment.assessment.fluency.score, comments: assessment.assessment.fluency.comments },
    { name: "Vocabulary", score: assessment.assessment.vocabulary.score, comments: assessment.assessment.vocabulary.comments },
    { name: "Grammar", score: assessment.assessment.grammar.score, comments: assessment.assessment.grammar.comments },
    { name: "Coherence", score: assessment.assessment.coherence.score, comments: assessment.assessment.coherence.comments },
    { name: "Pronunciation", score: assessment.assessment.pronunciation.score, comments: assessment.assessment.pronunciation.comments }
  ];

  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detailed Assessment</h3>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-sm font-medium">{category.score}/10</span>
            </div>
            <Progress 
              value={category.score * 10} 
              className="h-2" 
              indicatorClassName={getProgressColor(category.score)}
            />
            <p className="text-xs text-gray-500 mt-1">{category.comments}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailedScores;
