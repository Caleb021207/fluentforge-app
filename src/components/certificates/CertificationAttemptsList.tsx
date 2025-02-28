
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { CertificationAttempt } from "@/types/supabase";
import { Award, MessageSquare } from "lucide-react";

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
    // Special handling for conversation/fluency test
    if (type === "conversation" || type === "fluency") {
      return "Conversation Fluency";
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Add a helper function to ensure we display valid scores
  const getValidScore = (attempt: CertificationAttempt) => {
    if (attempt.score === null || 
        attempt.score === undefined || 
        isNaN(Number(attempt.score))) {
      return 0;
    }
    return attempt.score;
  };

  // Helper to get a valid date string
  const getFormattedDate = (attempt: CertificationAttempt) => {
    const dateString = attempt.completed_at || attempt.created_at || '';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Helper to get the proper icon for the certification type
  const getCertificationIcon = (type: string) => {
    if (type === "conversation" || type === "fluency") {
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
    return <Award className="h-4 w-4 text-blue-500" />;
  };
  
  // Filter out attempts with score 0 or fluency attempts that should be excluded
  const filteredAttempts = attempts?.filter(attempt => {
    // Filter out fluency attempts with 0 score
    if (attempt.certification_type === "fluency") {
      return attempt.score > 0;
    }
    
    // Filter out attempts with score 0
    if (attempt.score === 0) {
      return false;
    }
    
    return true;
  });

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
            {filteredAttempts && filteredAttempts.length > 0 ? (
              filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      {getCertificationIcon(attempt.certification_type)}
                      <h3 className="font-medium capitalize">{formatCertificationType(attempt.certification_type)}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getFormattedDate(attempt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <div className="font-medium">{getValidScore(attempt)}%</div>
                      <div className="text-sm text-gray-600">Level {determineLevel(getValidScore(attempt))}</div>
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
