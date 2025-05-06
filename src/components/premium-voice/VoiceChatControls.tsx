
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Clock } from "lucide-react";
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
        <div className="flex items-center gap-2 text-lg font-medium">
          <Clock className="h-5 w-5 text-red-500" />
          <span>{formatTime(timerValue)}</span>
        </div>
      );
    } else if (weeklyTimeRemaining !== null && !isActive) {
      return (
        <div className="flex items-center gap-2 text-lg text-muted-foreground">
          <Clock className="h-5 w-5" />
          {formatTime(weeklyTimeRemaining)} {t("remaining")}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <Button 
        onClick={startConversation}
        disabled={sessionStatus === 'loading' || weeklyTimeRemaining === 0}
        size="lg"
        variant={isActive ? "destructive" : "success"}
        className="flex items-center justify-center px-8 py-3 rounded-full text-lg"
      >
        {isActive ? (
          <MicOff className="h-6 w-6 mr-2" />
        ) : (
          <Mic className="h-6 w-6 mr-2" />
        )}
        
        <span>
          {isActive ? t("stopVoiceChat") : t("startVoiceChat")}
        </span>
      </Button>

      {renderRemainingTime()}
    </div>
  );
};

export default VoiceChatControls;
