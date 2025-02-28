
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCEFRColor, getCEFRDescription, TranscriptAssessment } from "../utils/assessmentUtils";

interface ScoreDisplayProps {
  assessment: TranscriptAssessment;
}

const ScoreDisplay = ({ assessment }: ScoreDisplayProps) => {
  // Calculate percentage for the progress bar (assuming score is out of 10)
  const scorePercentage = (assessment.overallScore / 10) * 100;
  
  return (
    <div className="space-y-4">
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
      
      <Progress 
        value={scorePercentage} 
        className="h-2 w-full"
        indicatorClassName={`bg-${assessment.cefrLevel === 'C2' ? 'purple' : 
          assessment.cefrLevel === 'C1' ? 'indigo' : 
          assessment.cefrLevel === 'B2' ? 'blue' : 
          assessment.cefrLevel === 'B1' ? 'green' : 
          assessment.cefrLevel === 'A2' ? 'yellow' : 
          'orange'}-500`}
      />
      
      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
        <p className="font-medium">
          {getCEFRDescription(assessment.cefrLevel)}
        </p>
      </div>
    </div>
  );
};

export default ScoreDisplay;
