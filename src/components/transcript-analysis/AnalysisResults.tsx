
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Award, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Analysis {
  id: string;
  file_name: string;
  upload_date: string;
  overall_score: number | null;
  cefr_level: string | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  listening_score: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  detailed_feedback: string | null;
  test_date: string | null;
  test_provider: string | null;
}

interface AnalysisResultsProps {
  analyses: Analysis[] | undefined;
  isLoading: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
          <p className="text-gray-500">Upload your first transcript to get started with AI analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const getCEFRColor = (level: string | null) => {
    switch (level) {
      case 'C2': return 'bg-purple-100 text-purple-800';
      case 'C1': return 'bg-indigo-100 text-indigo-800';
      case 'B2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-yellow-100 text-yellow-800';
      case 'A1': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-200';
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {analyses.map((analysis) => (
        <Card key={analysis.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {analysis.file_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Uploaded {format(new Date(analysis.upload_date), 'MMM d, yyyy')}
                  </span>
                  {analysis.test_date && (
                    <span>Test Date: {format(new Date(analysis.test_date), 'MMM d, yyyy')}</span>
                  )}
                  {analysis.test_provider && (
                    <span>Provider: {analysis.test_provider}</span>
                  )}
                </CardDescription>
              </div>
              {analysis.cefr_level && (
                <Badge className={getCEFRColor(analysis.cefr_level)}>
                  {analysis.cefr_level}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Overall Score */}
            {analysis.overall_score && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Score</span>
                  <span className="text-2xl font-bold">{analysis.overall_score}%</span>
                </div>
                <Progress value={analysis.overall_score} className="h-3" />
              </div>
            )}

            {/* Skill Breakdown */}
            {(analysis.reading_score || analysis.writing_score || analysis.speaking_score || analysis.listening_score) && (
              <div>
                <h4 className="font-medium mb-3">Skill Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.reading_score && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Reading</div>
                      <div className="text-lg font-bold">{analysis.reading_score}%</div>
                      <Progress value={analysis.reading_score} className="h-2 mt-1" />
                    </div>
                  )}
                  {analysis.writing_score && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Writing</div>
                      <div className="text-lg font-bold">{analysis.writing_score}%</div>
                      <Progress value={analysis.writing_score} className="h-2 mt-1" />
                    </div>
                  )}
                  {analysis.speaking_score && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Speaking</div>
                      <div className="text-lg font-bold">{analysis.speaking_score}%</div>
                      <Progress value={analysis.speaking_score} className="h-2 mt-1" />
                    </div>
                  )}
                  {analysis.listening_score && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Listening</div>
                      <div className="text-lg font-bold">{analysis.listening_score}%</div>
                      <Progress value={analysis.listening_score} className="h-2 mt-1" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-green-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm bg-green-50 p-2 rounded border-l-2 border-green-500">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-orange-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm bg-orange-50 p-2 rounded border-l-2 border-orange-500">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Detailed Feedback */}
            {analysis.detailed_feedback && (
              <div>
                <h4 className="font-medium mb-3">Detailed Analysis</h4>
                <div className="text-sm bg-gray-50 p-4 rounded-lg border">
                  {analysis.detailed_feedback}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisResults;
