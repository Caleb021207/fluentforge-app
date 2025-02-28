
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CertificationAttempt } from "@/types/supabase";
import CEFRLevelRubric from "./CEFRLevelRubric";
import CEFRLevelDescriptions from "./CEFRLevelDescriptions";

interface OverallCertificateProps {
  compositeScore: {
    score: number;
    level: string;
  } | null;
}

const OverallCertificate = ({ compositeScore }: OverallCertificateProps) => {
  if (!compositeScore) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle>Overall Language Proficiency Certificate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-blue-900">
            CEFR Level {compositeScore.level}
          </h2>
          <p className="text-gray-600">
            Overall Score: {compositeScore.score}%
          </p>
          <div className="p-4 border rounded-lg bg-white">
            <p className="text-sm text-gray-600">
              This certificate represents your current language proficiency level based on your highest test scores across all four skills: reading, writing, speaking, and listening.
            </p>
          </div>
        </div>
        <Progress value={compositeScore.score} className="h-2" />
        
        <CEFRLevelRubric />
        <CEFRLevelDescriptions />
      </CardContent>
    </Card>
  );
};

export default OverallCertificate;
