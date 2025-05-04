import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/hooks/useLocalization";

interface RecentAttemptsCardProps {
  attempts: {
    certification_type: string;
    score: number;
    completed_at: string;
  }[];
}

const RecentAttemptsCard = ({ attempts }: RecentAttemptsCardProps) => {
  const { t } = useLocalization();
  
  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentAttempts")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {t("noRecentAttempts")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentAttempts")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4">
            {attempts.map((attempt, index) => (
              <div key={index}>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="text-sm font-medium">{t(attempt.certification_type)}</div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(attempt.completed_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{attempt.score}%</div>
                    <div className="text-xs text-gray-500">
                      {t("level")} {determineLevel(attempt.score)}
                    </div>
                  </div>
                </div>
                {index < attempts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentAttemptsCard;

