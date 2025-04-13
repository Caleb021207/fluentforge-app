
import { useEffect, useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getTierDescription, getWeeklyTimeLimit } from "@/utils/tierUtils";
import { calculateRemainingWeeklyTime, formatResetDate, formatTime, calculateTimeUntilReset } from "@/utils/voiceChatUtils";
import TierUpgradePrompt from "./TierUpgradePrompt";

interface TierStatusCardProps {
  userTier: number;
  onRefresh?: () => void;
}

const TierStatusCard = ({ userTier, onRefresh }: TierStatusCardProps) => {
  const { t } = useLocalization();
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const maxTime = getWeeklyTimeLimit(userTier);
  const timeUsedPercentage = weeklyTimeRemaining !== null && maxTime ? 100 - (weeklyTimeRemaining / maxTime * 100) : 0;

  useEffect(() => {
    const fetchRemainingTime = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const remaining = await calculateRemainingWeeklyTime(user.id);
          setWeeklyTimeRemaining(remaining);
        }
      } catch (error) {
        console.error("Error fetching remaining time:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemainingTime();
  }, [userTier]);

  const handleRefresh = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = await calculateRemainingWeeklyTime(user.id);
        setWeeklyTimeRemaining(remaining);
        onRefresh?.();
      }
    } catch (error) {
      console.error("Error refreshing time data:", error);
    }
  };

  if (userTier === 1) {
    return null; // Don't show for free tier
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t("premiumVoiceTimeAllowance")}</CardTitle>
              <CardDescription>{t("tierResetInfo")}</CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 font-medium bg-lingua-100/50">
              {getTierDescription(userTier, t)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-lingua-500" />
                  <span className="font-medium">
                    {weeklyTimeRemaining !== null 
                      ? `${Math.floor(weeklyTimeRemaining / 60)} ${t("minutesPerWeek")} ${t("remaining")}`
                      : t("noTimeAllowance")}
                  </span>
                </div>
                <button 
                  onClick={handleRefresh} 
                  className="text-lingua-500 hover:text-lingua-700"
                  aria-label={t("refresh")}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              
              {maxTime > 0 && weeklyTimeRemaining !== null && (
                <div className="space-y-1">
                  <Progress value={timeUsedPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(weeklyTimeRemaining)}</span>
                    <span>{formatTime(maxTime)}</span>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>{t("nextResetTime", { time: formatResetDate() })}</p>
                <p>{t("timeRemainingThisWeek", { 
                  minutes: weeklyTimeRemaining !== null 
                    ? Math.ceil(weeklyTimeRemaining / 60) 
                    : 0 
                })}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <TierUpgradePrompt currentTier={userTier} />
    </div>
  );
};

export default TierStatusCard;
