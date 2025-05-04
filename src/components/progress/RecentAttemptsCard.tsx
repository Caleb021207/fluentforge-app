
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { useLocalization } from "@/context/LocalizationContext";

interface CertificationAttempt {
  id: string;
  completed_at?: string;
  created_at?: string;
  score: number;
  certification_type: string;
}

interface RecentAttemptsProps {
  attempts: CertificationAttempt[];
  hasTranscript: Record<string, boolean>;
  onViewAttempt: (attemptId: string) => void;
}

const RecentAttemptsCard = ({ attempts, hasTranscript, onViewAttempt }: RecentAttemptsProps) => {
  const { t, currentLanguage } = useLocalization();
  
  // Helper to check if attempt is complete - updated to consider fluency tests
  const isAttemptComplete = (attempt: CertificationAttempt) => {
    // For fluency tests, consider them complete if they have any score at all
    if (attempt.certification_type === "fluency" || 
        attempt.certification_type === "conversation") {
      return attempt.score > 0;
    }
    // For other tests, they need both a completed_at timestamp and a positive score
    return attempt.completed_at != null && attempt.score > 0;
  };

  // Helper to format certification type
  const formatCertificationType = (type: string) => {
    switch(type) {
      case "reading": return t("reading");
      case "writing": return t("writing");
      case "speaking": return t("speaking");
      case "listening": return t("listening");
      case "fluency": 
      case "conversation": return t("conversationalFluency");
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentCertificationAttempts")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {attempts.length > 0 ? (
              attempts.slice().reverse().map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{formatCertificationType(attempt.certification_type)}</h3>
                      {!isAttemptComplete(attempt) && (
                        <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-300 bg-yellow-50">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {currentLanguage === "spanish" ? "Incompleto" : "Incomplete"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(attempt.completed_at || attempt.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {isAttemptComplete(attempt) ? `${attempt.score}%` : "—"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isAttemptComplete(attempt) ? 
                        `${t("level")} ${determineLevel(attempt.score)}` : 
                        currentLanguage === "spanish" ? "No puntuado" : "Not scored"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-10">
                <p>{t("noAttempts")}</p>
                <p className="text-sm mt-2">{t("takeATest")}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentAttemptsCard;
