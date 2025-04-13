
import { Mic, MicOff, Clock, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { hasPremiumVoiceAccess } from "@/utils/tierUtils";

interface VoiceChatControlsProps {
  startConversation: () => void;
  isConversationActive: () => boolean;
  weeklyTimeRemaining: number | null;
  sessionStatus: 'available' | 'active' | 'cooldown' | 'unauthorized';
  formatTime: (seconds: number) => string;
  userTier: number;
}

const VoiceChatControls = ({ 
  startConversation, 
  isConversationActive, 
  weeklyTimeRemaining, 
  sessionStatus,
  formatTime,
  userTier
}: VoiceChatControlsProps) => {
  const { t } = useLocalization();
  const hasAccess = hasPremiumVoiceAccess(userTier);

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button 
          onClick={startConversation} 
          variant={isConversationActive() ? "destructive" : "default"} 
          className="bg-lingua-primary hover:bg-lingua-primary/90" 
          disabled={sessionStatus === 'cooldown' || sessionStatus === 'unauthorized'}
        >
          {isConversationActive() ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              {t("stopVoiceChat")}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              {t("startVoiceChat")}
            </>
          )}
        </Button>
        
        {!hasAccess && (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            <AlertOctagon className="h-4 w-4" />
            <span>{t("upgradeTierForAccess")}</span>
          </div>
        )}
        
        {hasAccess && weeklyTimeRemaining !== null && weeklyTimeRemaining > 0 && (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            <Clock className="h-4 w-4" />
            <span>{formatTime(weeklyTimeRemaining)} {t("remaining")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatControls;
