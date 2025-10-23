
import React from "react";
import { TranscriptAssessment, getCEFRColor, getCEFRDescription } from "../utils/assessmentUtils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AnalysisSectionProps {
  assessment: TranscriptAssessment;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ assessment }) => {
  const { 
    assessment: categories, 
    overallScore, 
    cefrLevel, 
    strengths, 
    areasForImprovement,
    feedbackSummary
  } = assessment;

  const categoryScores = [
    { 
      name: "Reading & Listening Comprehension", 
      score: categories.readingListeningComprehension.score, 
      comments: categories.readingListeningComprehension.comments 
    },
    { 
      name: "Written Production", 
      score: categories.writtenProduction.score, 
      comments: categories.writtenProduction.comments 
    },
    { 
      name: "Spoken Conversational Fluency", 
      score: categories.spokenConversationalFluency.score, 
      comments: categories.spokenConversationalFluency.comments 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Overall Score and CEFR Level */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{overallScore}/10</div>
                <Progress value={overallScore * 10} className="h-2 mb-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Beginner</span>
                  <span>Advanced</span>
                </div>
                
                <div className="text-center mt-4">
                  <Badge className={`text-lg py-1 px-3 ${getCEFRColor(cefrLevel)}`}>
                    {cefrLevel}
                  </Badge>
                  <p className="text-sm mt-2">{getCEFRDescription(cefrLevel)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <Card className="w-full md:w-2/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detailed Skills Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryScores.map((category) => (
                <div key={category.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm font-semibold">{category.score}/10</span>
                  </div>
                  <Progress value={category.score * 10} className="h-2" />
                  <p className="text-sm text-gray-600 italic">{category.comments}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Feedback Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{feedbackSummary}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-700">Strengths</h4>
              <ul className="list-disc pl-5 space-y-1">
                {strengths.map((strength, index) => (
                  <li key={index} className="text-sm">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-amber-700">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-1">
                {areasForImprovement.map((area, index) => (
                  <li key={index} className="text-sm">{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisSection;
