
import React from "react";
import { Activity } from "lucide-react";

interface AnalysisSectionProps {
  analysisData: any;
}

const AnalysisSection = ({ analysisData }: AnalysisSectionProps) => {
  if (!analysisData) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="h-5 w-5 text-lingua-primary" />
        Analysis
      </h3>
      <div className="p-4 bg-muted rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">{analysisData.analysis || "No detailed analysis available."}</pre>
        
        {analysisData.feedback && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Feedback</h4>
            <p className="text-sm">{analysisData.feedback}</p>
          </div>
        )}
        
        {analysisData.strengths && analysisData.strengths.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {analysisData.strengths.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {analysisData.areas_for_improvement && analysisData.areas_for_improvement.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Areas for Improvement</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {analysisData.areas_for_improvement.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSection;
