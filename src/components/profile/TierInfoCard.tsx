
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { getUserTier, getTierDescription, getWeeklyTimeLimit } from "@/utils/tierUtils";
import { Clock } from "lucide-react";
import AccessCodeRedemption from "@/components/access/AccessCodeRedemption";
import { calculateRemainingWeeklyTime, formatTime } from "@/utils/voiceChatUtils";

const TierInfoCard = () => {
  const { t } = useLocalization();
  const [userTier, setUserTier] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const checkUserTier = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        const tier = await getUserTier(user.id);
        setUserTier(tier);
        
        // Get remaining time
        if (tier > 1) {
          const remaining = await calculateRemainingWeeklyTime(user.id);
          setWeeklyTimeRemaining(remaining);
        }
      }
      
      setIsLoading(false);
    };
    
    checkUserTier();
  }, []);

  const handleUpgradeTier = async (newTier: number) => {
    setUserTier(newTier);
    
    // Refresh time allowance when tier changes
    if (userId && newTier > 1) {
      const remaining = await calculateRemainingWeeklyTime(userId);
      setWeeklyTimeRemaining(remaining);
    }
  };

  const getTimeAllowance = (tier: number): string => {
    const seconds = getWeeklyTimeLimit(tier);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes <= 0) {
      return t("noTimeAllowance");
    }
    
    return `${minutes} ${t("minutesPerWeek")}`;
  };
  
  const getTimeUsageDisplay = () => {
    if (weeklyTimeRemaining === null || userTier <= 1) return null;
    
    const maxTime = getWeeklyTimeLimit(userTier);
    const timeUsedPercentage = maxTime ? 100 - (weeklyTimeRemaining / maxTime * 100) : 0;
    const minutesRemaining = Math.ceil(weeklyTimeRemaining / 60);
    const maxMinutes = Math.floor(maxTime / 60);
    
    return (
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>{minutesRemaining} min {t("remaining")}</span>
          <span>{maxMinutes} min {t("total")}</span>
        </div>
        <Progress value={timeUsedPercentage} className="h-2" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("accountTier")}</CardTitle>
          <CardDescription>{t("yourCurrentPlanAndFeatures")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t("currentTier")}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="px-3 py-1 font-medium bg-lingua-100/50">
                      {getTierDescription(userTier, t)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t("premiumVoiceTimeAllowance")}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-lingua-600" />
                    <span>{getTimeAllowance(userTier)}</span>
                  </div>
                </div>
              </div>
              
              {getTimeUsageDisplay()}
              
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">{t("tierFeatures")}</h3>
                <ul className="space-y-2 text-sm">
                  {userTier >= 2 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{t("premiumVoiceAccess")}</span>
                    </li>
                  )}
                  {userTier >= 3 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{t("increasedTimeAllowance")}</span>
                    </li>
                  )}
                  {userTier >= 4 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{t("prioritySupport")}</span>
                    </li>
                  )}
                  {userTier >= 5 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{t("fullContentAccess")}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AccessCodeRedemption onSuccess={handleUpgradeTier} />
    </div>
  );
};

export default TierInfoCard;
