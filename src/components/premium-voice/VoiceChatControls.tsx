
import React from "react";
import { Button } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import type { SessionStatus } from "@/types/chat";

interface VoiceChatControlsProps {
  startConversation: () => Promise<void>;
  isConversationActive: () => boolean;
  weeklyTimeRemaining: number | null;
  sessionStatus: SessionStatus;
  timerValue: number | null;
  formatTime: (seconds: number) => string;
}

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  startConversation,
  isConversationActive,
  weeklyTimeRemaining,
  sessionStatus,
  timerValue,
  formatTime
}) => {
  const { t } = useLocalization();
  const isActive = isConversationActive();

  const renderRemainingTime = () => {
    if (timerValue !== null && isActive) {
      return (
        <div className="ml-3 flex items-center gap-2 text-sm">
          <span className="animate-pulse bg-red-500 w-2 h-2 rounded-full"></span>
          <span>{formatTime(timerValue)}</span>
        </div>
      );
    } else if (weeklyTimeRemaining !== null && !isActive) {
      return (
        <div className="ml-3 text-sm text-muted-foreground">
          {formatTime(weeklyTimeRemaining)} {t("remaining")}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center md:flex-row gap-4 mb-6">
      <Button 
        onClick={startConversation}
        disabled={sessionStatus === 'loading' || weeklyTimeRemaining === 0}
        className={`flex items-center justify-center px-6 py-2 rounded-full ${
          isActive ? "bg-red-500 hover:bg-red-600" : "bg-lingua-primary hover:bg-lingua-primary-dark"
        }`}
      >
        {sessionStatus === 'loading' ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : isActive ? (
          <MicOff className="h-5 w-5 mr-2" />
        ) : (
          <Mic className="h-5 w-5 mr-2" />
        )}
        
        <span>
          {sessionStatus === 'loading' ? t("connecting") : 
            isActive ? t("stopVoiceChat") : t("startVoiceChat")}
        </span>
      </Button>

      {renderRemainingTime()}
    </div>
  );
};

export default VoiceChatControls;
