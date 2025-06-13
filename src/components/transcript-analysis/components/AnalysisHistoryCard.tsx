
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Analysis } from "../types";
import { getCEFRColor } from "../utils/cefrUtils";

interface AnalysisHistoryCardProps {
  analyses: Analysis[];
}

const AnalysisHistoryCard: React.FC<AnalysisHistoryCardProps> = ({ analyses }) => {
  const historicalAnalyses = analyses.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>
          Your previous {historicalAnalyses.length} analysis results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {historicalAnalyses.map((analysis) => (
            <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                <div className="font-medium text-foreground">{analysis.file_name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(analysis.upload_date), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">{analysis.overall_score || 'N/A'}%</div>
                {analysis.cefr_level && (
                  <Badge className={getCEFRColor(analysis.cefr_level)} variant="outline">
                    {analysis.cefr_level}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisHistoryCard;
