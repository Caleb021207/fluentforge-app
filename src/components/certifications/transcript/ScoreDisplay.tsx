
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getCEFRColor, getCEFRDescription, TranscriptAssessment } from "../utils/assessmentUtils";

interface ScoreDisplayProps {
  assessment: TranscriptAssessment;
}

const ScoreDisplay = ({ assessment }: ScoreDisplayProps) => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Overall Score:</span>{" "}
          <span className="text-lg font-bold">{assessment.overallScore.toFixed(1)}/10</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">CEFR Level:</span>{" "}
          <Badge className={`text-sm font-semibold px-3 py-1 ${getCEFRColor(assessment.cefrLevel)}`}>
            {assessment.cefrLevel}
          </Badge>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
        <p className="font-medium">
          {getCEFRDescription(assessment.cefrLevel)}
        </p>
      </div>
    </div>
  );
};

export default ScoreDisplay;
