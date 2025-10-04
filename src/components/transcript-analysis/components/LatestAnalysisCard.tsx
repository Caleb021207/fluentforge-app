
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Analysis } from "../types";

interface LatestAnalysisCardProps {
  analysis: Analysis;
}

const LatestAnalysisCard: React.FC<LatestAnalysisCardProps> = ({ analysis }) => {
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
        <CardTitle>Latest Analysis Results</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(new Date(analysis.upload_date), 'MMM d, yyyy')} - {analysis.file_name}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{analysis.overall_score || 'N/A'}%</div>
            <Badge className={getCEFRColor(analysis.cefr_level)}>
              {analysis.cefr_level || 'N/A'}
            </Badge>
          </div>
          
          {analysis.reading_listening_score !== null && (
            <div className="text-center">
              <div className="text-lg font-semibold">Reading & Listening</div>
              <div className="text-2xl font-bold">{analysis.reading_listening_score}%</div>
            </div>
          )}
          
          {analysis.written_production_score !== null && (
            <div className="text-center">
              <div className="text-lg font-semibold">Written Production</div>
              <div className="text-2xl font-bold">{analysis.written_production_score}%</div>
            </div>
          )}
          
          {analysis.spoken_fluency_score !== null && (
            <div className="text-center">
              <div className="text-lg font-semibold">Spoken Fluency</div>
              <div className="text-2xl font-bold">{analysis.spoken_fluency_score}%</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestAnalysisCard;
