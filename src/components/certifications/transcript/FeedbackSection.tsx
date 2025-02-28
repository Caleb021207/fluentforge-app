
import React from "react";
import { TranscriptAssessment } from "../utils/assessmentUtils";
import { CheckCircle, XCircle } from "lucide-react";

interface FeedbackSectionProps {
  assessment: TranscriptAssessment;
}

const FeedbackSection = ({ assessment }: FeedbackSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">Assessment Feedback</h3>
        <p className="text-gray-700 mb-4">{assessment.feedbackSummary}</p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-medium flex items-center text-green-700 mb-2">
              <CheckCircle className="mr-2 h-4 w-4" /> Strengths
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {assessment.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-600">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium flex items-center text-amber-700 mb-2">
              <XCircle className="mr-2 h-4 w-4" /> Areas for Improvement
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {assessment.areasForImprovement.map((area, index) => (
                <li key={index} className="text-sm text-gray-600">{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
