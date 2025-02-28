
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { CertificationAttempt } from "@/types/supabase";

interface CertificateScoreCardProps {
  type: string;
  attempt: CertificationAttempt | undefined;
}

const CertificateScoreCard = ({ type, attempt }: CertificateScoreCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{type}</CardTitle>
      </CardHeader>
      <CardContent>
        {attempt ? (
          <>
            <Progress value={attempt.score} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Score: {attempt.score}%</span>
              <span>Level: {determineLevel(attempt.score)}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">No attempts yet</div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateScoreCard;
