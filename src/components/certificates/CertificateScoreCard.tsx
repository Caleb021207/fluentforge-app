
import React from "react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">{getIcon()} {formatType(type)}</CardTitle>
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
