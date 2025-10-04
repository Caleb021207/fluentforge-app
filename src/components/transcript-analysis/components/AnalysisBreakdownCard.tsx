
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisBreakdownCardProps {
  strengths: string[] | null;
  weaknesses: string[] | null;
}

const AnalysisBreakdownCard: React.FC<AnalysisBreakdownCardProps> = ({ strengths, weaknesses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {strengths && (
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Strengths</h4>
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {weaknesses && (
            <div>
              <h4 className="font-semibold mb-3 text-orange-700">Areas for Improvement</h4>
              <ul className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    {weakness}
                  </li>
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
