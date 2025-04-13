
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { TIER_TIME_LIMITS } from "@/utils/tierUtils";

interface TierUpgradePromptProps {
  currentTier: number;
}

const TierUpgradePrompt = ({ currentTier }: TierUpgradePromptProps) => {
  const { t } = useLocalization();
  
  // Don't show for top tier
  if (currentTier >= 5) {
    return null;
  }
  
  const nextTier = Math.min(5, currentTier + 1);
  const currentMinutes = Math.floor(TIER_TIME_LIMITS[currentTier as keyof typeof TIER_TIME_LIMITS] / 60);
  const nextMinutes = Math.floor(TIER_TIME_LIMITS[nextTier as keyof typeof TIER_TIME_LIMITS] / 60);
  
  return (
    <Card className="bg-gradient-to-br from-lingua-50 to-white border-lingua-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 text-amber-500 mr-2" />
          {t("upgradeYourTier")}
        </CardTitle>
        <CardDescription>{t("getMorePremiumTime")}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1 text-lingua-500" />
            <span>{t("currentAllowance")}: {currentMinutes} {t("minutesPerWeek")}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-lingua-700">
            <Clock className="h-4 w-4 mr-1" />
            <span>{t("nextTierAllowance")}: {nextMinutes} {t("minutesPerWeek")}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          {t("upgradeToGetMoreTime")}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to="/profile" className="flex items-center justify-center">
            {t("upgradeNow")}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TierUpgradePrompt;
