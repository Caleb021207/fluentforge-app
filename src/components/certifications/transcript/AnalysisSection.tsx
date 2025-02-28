
import React from "react";
import { Activity, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalysisSectionProps {
  analysisData: any;
}

const AnalysisSection = ({ analysisData }: AnalysisSectionProps) => {
  if (!analysisData) {
    return null;
  }

  // Check if analysis data is empty or invalid
  const isValidAnalysis = typeof analysisData === 'object' && Object.keys(analysisData).length > 0;
  
  if (!isValidAnalysis) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Analysis data is not available or in an unexpected format.
        </AlertDescription>
      </Alert>
    );
  }

  // Extract key data safely
  const analysis = analysisData.analysis || '';
  const speakingLevel = analysisData.speakingLevel || 'N/A';
  const speakingScore = analysisData.speakingScore || '0';
  const listeningLevel = analysisData.listeningLevel || 'N/A';
  const listeningScore = analysisData.listeningScore || '0';
  const feedback = analysisData.feedback || '';
  const strengths = Array.isArray(analysisData.strengths) ? analysisData.strengths : [];
  const areasForImprovement = Array.isArray(analysisData.areas_for_improvement) 
    ? analysisData.areas_for_improvement 
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="h-5 w-5 text-lingua-primary" />
        Analysis
      </h3>
      
      {/* Summary scores section */}
      {(speakingLevel !== 'N/A' || listeningLevel !== 'N/A') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {speakingLevel !== 'N/A' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">Speaking</h4>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{speakingLevel}</span>
                <span className="text-lg">{speakingScore}%</span>
              </div>
            </div>
          )}
          
          {listeningLevel !== 'N/A' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-800 mb-1">Listening</h4>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{listeningLevel}</span>
                <span className="text-lg">{listeningScore}%</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Detailed analysis */}
      <div className="p-4 bg-muted rounded-lg">
        {analysis ? (
          <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
        ) : (
          <p className="text-gray-500 italic text-sm">No detailed analysis available.</p>
        )}
        
        {feedback && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Feedback</h4>
            <p className="text-sm">{feedback}</p>
          </div>
        )}
        
        {strengths.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {strengths.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {areasForImprovement.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Areas for Improvement</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {areasForImprovement.map((item: string, i: number) => (
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
