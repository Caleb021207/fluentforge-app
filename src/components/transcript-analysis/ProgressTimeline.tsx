
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Analysis {
  id: string;
  upload_date: string;
  overall_score: number | null;
  cefr_level: string | null;
  file_name: string;
}

interface Milestone {
  id: string;
  milestone_type: string;
  previous_value: number | null;
  current_value: number | null;
  improvement_percentage: number | null;
  achievement_date: string;
  description: string | null;
}

interface ProgressTimelineProps {
  analyses: Analysis[] | undefined;
  milestones: Milestone[] | undefined;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ analyses, milestones }) => {
  const sortedAnalyses = analyses?.sort((a, b) => 
    new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
  ) || [];

  const getCEFRColor = (level: string | null) => {
    switch (level) {
      case 'C2': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'C1': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'B2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'B1': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'A2': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'A1': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No progress data yet</h3>
          <p className="text-muted-foreground">Upload multiple transcripts to see your progress timeline.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>
            Track your language learning journey over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedAnalyses.length > 1 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">First Test</div>
                  <div className="font-bold text-foreground">{sortedAnalyses[0]?.overall_score || 'N/A'}%</div>
                  <Badge className={getCEFRColor(sortedAnalyses[0]?.cefr_level)}>
                    {sortedAnalyses[0]?.cefr_level || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Latest Test</div>
                  <div className="font-bold text-foreground">{sortedAnalyses[sortedAnalyses.length - 1]?.overall_score || 'N/A'}%</div>
                  <Badge className={getCEFRColor(sortedAnalyses[sortedAnalyses.length - 1]?.cefr_level)}>
                    {sortedAnalyses[sortedAnalyses.length - 1]?.cefr_level || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Improvement</div>
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {(() => {
                      const first = sortedAnalyses[0]?.overall_score;
                      const latest = sortedAnalyses[sortedAnalyses.length - 1]?.overall_score;
                      if (first && latest) {
                        const improvement = latest - first;
                        return improvement > 0 ? `+${improvement}%` : `${improvement}%`;
                      }
                      return 'N/A';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {sortedAnalyses.map((analysis, index) => (
              <div key={analysis.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{analysis.file_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(analysis.upload_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{analysis.overall_score || 'N/A'}%</div>
                      {analysis.cefr_level && (
                        <Badge className={getCEFRColor(analysis.cefr_level)}>
                          {analysis.cefr_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {milestones && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements & Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-grow">
                    <div className="font-medium text-foreground">{milestone.milestone_type.replace('_', ' ').toUpperCase()}</div>
                    {milestone.description && (
                      <div className="text-sm text-muted-foreground">{milestone.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(milestone.achievement_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {milestone.improvement_percentage && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        +{milestone.improvement_percentage}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTimeline;
