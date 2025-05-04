
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { determineLevel, ensureValidScore } from "@/components/certifications/utils/scoreUtils";
import { CertificationAttempt } from "@/types/supabase";
import { Award, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/context/LocalizationContext";

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
  const { t, currentLanguage } = useLocalization();

  const formatCertificationType = (type: string) => {
    // Special handling for conversation/fluency test
    if (type === "conversation" || type === "fluency") {
      return t("conversationalFluency");
    }
    
    switch(type) {
      case "reading": return t("reading");
      case "writing": return t("writing");
      case "speaking": return t("speaking");
      case "listening": return t("listening");
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Add a helper function to ensure we display valid scores
  const getValidScore = (attempt: CertificationAttempt) => {
    return ensureValidScore(attempt.score);
  };

  // Helper to get a valid date string
  const getFormattedDate = (attempt: CertificationAttempt) => {
    const dateString = attempt.completed_at || attempt.created_at || '';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return currentLanguage === "spanish" ? 'Fecha desconocida' : 'Unknown date';
    }
  };

  // Helper to get the proper icon for the certification type
  const getCertificationIcon = (type: string) => {
    if (type === "conversation" || type === "fluency") {
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
    return <Award className="h-4 w-4 text-blue-500" />;
  };

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

  // Filter out any attempts that aren't one of the four core skills or fluency/conversation
  const filteredAttempts = attempts?.filter(attempt => 
    ['reading', 'writing', 'speaking', 'listening', 'fluency', 'conversation'].includes(attempt.certification_type)
  );
  
  if (isLoading) {
    return <div>{currentLanguage === "spanish" ? "Cargando datos de certificación..." : "Loading certification data..."}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("certificationHistory")}</CardTitle>
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
                      {!isAttemptComplete(attempt) && (
                        <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-300 bg-yellow-50">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {currentLanguage === "spanish" ? "Incompleto" : "Incomplete"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getFormattedDate(attempt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <div className="font-medium">
                        {isAttemptComplete(attempt) ? `${getValidScore(attempt)}%` : "—"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isAttemptComplete(attempt) 
                          ? `${t("level")} ${determineLevel(getValidScore(attempt))}`
                          : currentLanguage === "spanish" ? "No puntuado" : "Not scored"}
                      </div>
                    </div>
                    {hasTranscript[attempt.id] && (
                      <button
                        onClick={() => onViewAttempt(attempt.id)}
                        className="text-blue-500 text-sm underline"
                      >
                        {t("viewDetails")}
                      </button>
                    )}
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

export default CertificationAttemptsList;
