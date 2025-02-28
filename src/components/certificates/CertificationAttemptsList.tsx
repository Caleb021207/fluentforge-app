
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { CertificationAttempt } from "@/types/supabase";
import { Award } from "lucide-react";

interface CertificationAttemptsListProps {
  attempts: CertificationAttempt[] | undefined;
  hasTranscript: Record<string, boolean>;
  onViewAttempt: (attemptId: string) => void;
  isLoading: boolean;
}

const CertificationAttemptsList = ({ 
  attempts, 
  hasTranscript, 
  onViewAttempt, 
  isLoading 
}: CertificationAttemptsListProps) => {
  const formatCertificationType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return <div>Loading certification data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Certification Attempts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {attempts && attempts.length > 0 ? (
              attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <h3 className="font-medium capitalize">{formatCertificationType(attempt.certification_type)}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(attempt.completed_at || ''), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <div className="font-medium">{attempt.score}%</div>
                      <div className="text-sm text-gray-600">Level {determineLevel(attempt.score)}</div>
                    </div>
                    {hasTranscript[attempt.id] && (
                      <button
                        onClick={() => onViewAttempt(attempt.id)}
                        className="text-blue-500 text-sm underline"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-10">
                <p>No certification attempts recorded yet</p>
                <p className="text-sm mt-2">Take a test to see your results here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CertificationAttemptsList;
