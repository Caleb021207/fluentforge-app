
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { CertificationAttempt } from "@/types/supabase";
import { Award, MessageSquare } from "lucide-react";

interface CertificateScoreCardProps {
  type: string;
  attempt: CertificationAttempt | undefined;
}

const CertificateScoreCard = ({ type, attempt }: CertificateScoreCardProps) => {
  // Debug log to verify the data is correctly passed
  useEffect(() => {
    if (type === 'conversation') {
      console.log(`CertificateScoreCard for ${type} received attempt:`, attempt);
    }
  }, [type, attempt]);
  
  const formatType = (type: string) => {
    if (type === "conversation") {
      return "Conversation Fluency";
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getIcon = () => {
    if (type === "conversation") {
      return <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />;
    }
    return <Award className="h-4 w-4 text-blue-500 mr-2" />;
  };

  // Make sure we have a valid score value
  const getScore = () => {
    if (!attempt || attempt.score === undefined || attempt.score === null) {
      return 0;
    }
    return attempt.score;
  };

  const score = getScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">{getIcon()} {formatType(type)}</CardTitle>
      </CardHeader>
      <CardContent>
        {attempt ? (
          <>
            <Progress value={score} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Score: {score}%</span>
              <span>Level: {determineLevel(score)}</span>
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
