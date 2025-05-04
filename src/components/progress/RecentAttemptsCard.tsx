
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { Eye } from "lucide-react";

interface RecentAttemptsCardProps {
  attempts: any[];
  hasTranscript: Record<string, boolean>;
  onViewAttempt: (attemptId: string) => Promise<void>;
}

const RecentAttemptsCard: React.FC<RecentAttemptsCardProps> = ({
  attempts,
  hasTranscript,
  onViewAttempt
}) => {
  const { t } = useLocalization();
  
  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentCertificationAttempts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("noAttemptsYet")}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentCertificationAttempts")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex items-center justify-between p-3 bg-muted rounded-md"
            >
              <div>
                <p className="font-medium">{new Date(attempt.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">{t("score")}: {attempt.score || "N/A"}</p>
              </div>
              {hasTranscript[attempt.id] && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewAttempt(attempt.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t("view")}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAttemptsCard;
