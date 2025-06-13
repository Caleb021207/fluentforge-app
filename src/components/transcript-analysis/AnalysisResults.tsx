
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, TrendingUp, Target, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Analysis {
  id: string;
  upload_date: string;
  overall_score: number | null;
  cefr_level: string | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  listening_score: number | null;
  test_provider: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  detailed_feedback: string | null;
  file_name: string;
}

interface AnalysisResultsProps {
  analyses: Analysis[] | undefined;
  isLoading: boolean;
}

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

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading your analysis results...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No analyses yet</h3>
          <p className="text-muted-foreground">Upload a transcript to see your first AI analysis here.</p>
        </CardContent>
      </Card>
    );
  }

  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-6">
      {/* Latest Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Latest Analysis Results
          </CardTitle>
          <CardDescription>
            {format(new Date(latestAnalysis.upload_date), 'MMM d, yyyy')} - {latestAnalysis.file_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-foreground">
                  {latestAnalysis.overall_score || 'N/A'}%
                </div>
                {latestAnalysis.cefr_level && (
                  <Badge className={getCEFRColor(latestAnalysis.cefr_level)}>
                    {latestAnalysis.cefr_level}
                  </Badge>
                )}
              </div>
              {latestAnalysis.overall_score && (
                <Progress value={latestAnalysis.overall_score} className="h-3" />
              )}
            </div>

            {/* Skill Breakdown */}
            <div className="space-y-3">
              {[
                { name: 'Reading', score: latestAnalysis.reading_score },
                { name: 'Writing', score: latestAnalysis.writing_score },
                { name: 'Speaking', score: latestAnalysis.speaking_score },
                { name: 'Listening', score: latestAnalysis.listening_score },
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

      {/* What our AI can analyze */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">What our AI can analyze:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Strengths
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Pronunciation</li>
                <li>• Oral Communication</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Reading Comprehension</li>
                <li>• Listening Comprehension</li>
                <li>• Written Expression</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {latestAnalysis.detailed_feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {latestAnalysis.detailed_feedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Strengths and Weaknesses */}
      {(latestAnalysis.strengths || latestAnalysis.weaknesses) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestAnalysis.strengths && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Strengths</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {latestAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="text-foreground">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {latestAnalysis.weaknesses && (
                <div>
                  <h4 className="font-semibold mb-3 text-amber-600 dark:text-amber-400">Areas for Improvement</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {latestAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-foreground">{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {latestAnalysis.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {latestAnalysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* All Analyses History */}
      {analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>
              Your previous {analyses.length - 1} analysis results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyses.slice(1).map((analysis) => (
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
      )}
    </div>
  );
};

export default AnalysisResults;
