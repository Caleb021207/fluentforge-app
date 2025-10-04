
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Analysis } from "../types";

interface AnalysisHistoryCardProps {
  analyses: Analysis[];
}

const AnalysisHistoryCard: React.FC<AnalysisHistoryCardProps> = ({ analyses }) => {
  const getCEFRColor = (level: string | null) => {
    switch (level) {
      case 'C2': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'C1': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'B2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'B1': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'A2': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'A1': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your {analyses.length - 1} previous analysis results
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analyses.slice(1).map((analysis) => (
            <div key={analysis.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium">{analysis.file_name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(analysis.upload_date), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{analysis.overall_score || 'N/A'}%</div>
                {analysis.cefr_level && (
                  <Badge className={getCEFRColor(analysis.cefr_level)}>
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
