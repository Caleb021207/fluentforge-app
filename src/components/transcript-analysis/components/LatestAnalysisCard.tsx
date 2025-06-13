
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { format } from "date-fns";
import { Analysis } from "../types";
import { getCEFRColor } from "../utils/cefrUtils";

interface LatestAnalysisCardProps {
  analysis: Analysis;
}

const LatestAnalysisCard: React.FC<LatestAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Latest Analysis Results
        </CardTitle>
        <CardDescription>
          {format(new Date(analysis.upload_date), 'MMM d, yyyy')} - {analysis.file_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Score */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-foreground">
                {analysis.overall_score || 'N/A'}%
              </div>
              {analysis.cefr_level && (
                <Badge className={getCEFRColor(analysis.cefr_level)}>
                  {analysis.cefr_level}
                </Badge>
              )}
            </div>
            {analysis.overall_score && (
              <Progress value={analysis.overall_score} className="h-3" />
            )}
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-3">
            {[
              { name: 'Reading', score: analysis.reading_score },
              { name: 'Writing', score: analysis.writing_score },
              { name: 'Speaking', score: analysis.speaking_score },
              { name: 'Listening', score: analysis.listening_score },
            ].map((skill) => (
              skill.score && (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{skill.score}%</span>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                </div>
              )
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestAnalysisCard;
