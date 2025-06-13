
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisBreakdownCardProps {
  strengths?: string[] | null;
  weaknesses?: string[] | null;
}

const AnalysisBreakdownCard: React.FC<AnalysisBreakdownCardProps> = ({ strengths, weaknesses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengths && (
            <div>
              <h4 className="font-semibold mb-3 text-primary">Strengths</h4>
              <ul className="list-disc pl-5 space-y-1">
                {strengths.map((strength, index) => (
                  <li key={index} className="text-foreground">{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {weaknesses && (
            <div>
              <h4 className="font-semibold mb-3 text-amber-600 dark:text-amber-400">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-1">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="text-foreground">{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisBreakdownCard;
