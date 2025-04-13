
import React, { useEffect, useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, FileText, Star, Key, Clock } from "lucide-react";
import ParentalControls from "@/components/compliance/ParentalControls";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AccessCodeRedemption from "@/components/access/AccessCodeRedemption";
import { getUserTier, getTierDescription, getWeeklyTimeLimit } from "@/utils/tierUtils";
import { formatTime } from "@/utils/voiceChatUtils";

const Settings = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserTier = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const tier = await getUserTier(data.session.user.id);
          setUserTier(tier);
        }
      } catch (error) {
        console.error("Error fetching user tier:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTier();
  }, []);
  
  const handleTierUpdate = (newTier: number) => {
    setUserTier(newTier);
  };
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("settings")}</h1>
      
      {/* Account Tier Section */}
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center gap-2">
          <Star size={20} className="text-yellow-500" />
          <div>
            <CardTitle>{t("accountTier")}</CardTitle>
            <CardDescription>{t("yourCurrentPlanAndFeatures")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-24 rounded-md bg-gray-100"></div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">{t("currentTier")}:</span>
                <span className="text-xl font-semibold">{getTierDescription(userTier, t)}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">{t("premiumVoiceTimeAllowance")}:</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-medium">
                    {getWeeklyTimeLimit(userTier) > 0 
                      ? `${formatTime(getWeeklyTimeLimit(userTier))} ${t("minutesPerWeek")}`
                      : t("noTimeAllowance")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Access Code Redemption Section */}
      <div className="mb-6">
        <AccessCodeRedemption onSuccess={handleTierUpdate} />
      </div>
      
      {/* Safety Policy Section */}
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield size={20} className="text-primary" />
          <div>
            <CardTitle>{t("parentalControls")}</CardTitle>
            <CardDescription>{t("parentalControlsDescription")}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => navigate("/safety-policy")}
          >
            <FileText size={16} />
            {t("safetyPolicy")}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-4">
        <ParentalControls />
      </div>
    </div>
  );
};

export default Settings;
