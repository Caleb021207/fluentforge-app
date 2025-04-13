
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import PageHeader from "@/components/premium-voice/PageHeader";
import BenefitsList from "@/components/premium-voice/BenefitsList";
import LoginPrompt from "@/components/premium-voice/LoginPrompt";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceChatControls from "@/components/premium-voice/VoiceChatControls";
import CooldownMessage from "@/components/premium-voice/CooldownMessage";
import TierIndicator from "@/components/premium-voice/TierIndicator";
import TierStatusCard from "@/components/premium-voice/TierStatusCard";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useVoiceChatTimer } from "@/hooks/useVoiceChatTimer";
import { hasPremiumVoiceAccess } from "@/utils/tierUtils";
import { Link } from "react-router-dom";
import { ArrowUpCircle } from "lucide-react";

const PremiumVoiceChat = () => {
  const { t } = useLocalization();
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>(""); 

  const {
    isLoggedIn,
    isLoading,
    sessionStatus,
    weeklyTimeRemaining,
    cooldownTimeRemaining,
    userTier,
    createSession,
    endSession,
    currentSessionId,
    formatCooldownTime,
    checkSessionStatus
  } = useSessionManagement(t);
  
  const isConversationActive = () => isVoiceChatActive;
  
  const { timerValue, formatTimer } = useVoiceChatTimer({
    isConversationActive,
    weeklyTimeRemaining,
    onTimeExpired: async () => {
      setIsVoiceChatActive(false);
      if (currentSessionId) {
        await endSession(currentSessionId);
      }
    },
    t
  });

  const hasAccess = hasPremiumVoiceAccess(userTier);

  const handleStartConversation = async () => {
    if (isVoiceChatActive) {
      setIsVoiceChatActive(false);
      if (currentSessionId) {
        await endSession(currentSessionId);
      }
      return;
    }
    
    if (!isLoggedIn) {
      return;
    }
    
    if (sessionStatus === 'cooldown') {
      return;
    }
    
    const sessionId = await createSession();
    if (sessionId) {
      setIsVoiceChatActive(true);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="h-24 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPrompt />;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <PageHeader />
        <TierIndicator userTier={userTier} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <BenefitsList />
          
          {!hasAccess && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-amber-800">{t("premiumFeatureRestricted")}</h3>
              <p className="mt-2 text-amber-700">{t("upgradeTierForAccess")}</p>
              <Button asChild className="mt-3" variant="outline">
                <Link to="/profile">
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  {t("upgradeAccount")}
                </Link>
              </Button>
            </div>
          )}
          
          <CooldownMessage 
            cooldownTimeRemaining={cooldownTimeRemaining} 
            sessionStatus={sessionStatus} 
            formatCooldownTime={formatCooldownTime} 
          />
          
          <VoiceChatControls 
            startConversation={handleStartConversation}
            isConversationActive={isConversationActive}
            weeklyTimeRemaining={timerValue}
            sessionStatus={sessionStatus}
            formatTime={formatTimer}
            userTier={userTier}
          />
          
          <div className="space-y-4">
            <Textarea
              placeholder={t("typeYourMessageHere")}
              className="min-h-[120px]"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              disabled={!isVoiceChatActive || sessionStatus === 'cooldown'}
            />
            
            <Button 
              className="w-full" 
              disabled={!isVoiceChatActive || !currentPrompt.trim() || sessionStatus === 'cooldown'}
            >
              {t("sendMessage")}
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <TierStatusCard 
            userTier={userTier}
            onRefresh={checkSessionStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumVoiceChat;
