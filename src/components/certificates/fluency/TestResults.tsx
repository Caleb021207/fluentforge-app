
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TestResultsProps {
  testResult: any;
  onReset: () => void;
}

const TestResults = ({ testResult, onReset }: TestResultsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Speaking Results</h3>
          <div className="mb-2">
            <span className="font-medium">Score:</span> {testResult?.speaking?.overallScore}%
          </div>
          <div className="mb-2">
            <span className="font-medium">CEFR Level:</span> {testResult?.speaking?.level}
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium mb-2">Speaking Skills</h4>
            <div className="flex justify-between mb-1">
              <span>Pronunciation</span>
              <span>{testResult?.speaking?.pronunciation}/10</span>
            </div>
            <Progress value={testResult?.speaking?.pronunciation * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Fluency</span>
              <span>{testResult?.speaking?.fluency}/10</span>
            </div>
            <Progress value={testResult?.speaking?.fluency * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Grammar</span>
              <span>{testResult?.speaking?.grammar}/10</span>
            </div>
            <Progress value={testResult?.speaking?.grammar * 10} className="h-2" />
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Listening Results</h3>
          <div className="mb-2">
            <span className="font-medium">Score:</span> {testResult?.listening?.overallScore}%
          </div>
          <div className="mb-2">
            <span className="font-medium">CEFR Level:</span> {testResult?.listening?.level}
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium mb-2">Listening Skills</h4>
            <div className="flex justify-between mb-1">
              <span>Understanding</span>
              <span>{testResult?.listening?.understanding}/10</span>
            </div>
            <Progress value={testResult?.listening?.understanding * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Vocabulary</span>
              <span>{testResult?.listening?.vocabulary}/10</span>
            </div>
            <Progress value={testResult?.listening?.vocabulary * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Response Quality</span>
              <span>{testResult?.listening?.interaction}/10</span>
            </div>
            <Progress value={testResult?.listening?.interaction * 10} className="h-2" />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Feedback</h3>
        <p className="text-gray-700 mb-4">{testResult?.feedback}</p>
        
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Strengths:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {testResult?.strengths?.map((strength: string, i: number) => (
              <li key={i} className="text-gray-700">{strength}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2">Areas for Improvement:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {testResult?.areasToImprove?.map((area: string, i: number) => (
              <li key={i} className="text-gray-700">{area}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <Button onClick={onReset}>Take Test Again</Button>
    </div>
  );
};

export default TestResults;
