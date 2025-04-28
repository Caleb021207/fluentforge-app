
import { Mic, MicOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface VoiceChatControlsProps {
  startConversation: () => void;
  isConversationActive: () => boolean;
  weeklyTimeRemaining: number | null;
  sessionStatus: 'available' | 'active' | 'cooldown';
  timerValue: number | null;
  formatTime: (seconds: number) => string;
}

const VoiceChatControls = ({ 
  startConversation, 
  isConversationActive, 
  weeklyTimeRemaining, 
  sessionStatus,
  timerValue,
  formatTime
}: VoiceChatControlsProps) => {
  const { t } = useLocalization();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button 
          onClick={startConversation} 
          variant={isConversationActive() ? "destructive" : "default"} 
          className="bg-lingua-primary hover:bg-lingua-primary/90" 
          disabled={sessionStatus === 'cooldown'}
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
        
        {isConversationActive() && timerValue !== null ? (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timerValue)}</span>
          </div>
        ) : (
          weeklyTimeRemaining !== null && weeklyTimeRemaining > 0 && (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{formatTime(weeklyTimeRemaining)} {t("remaining")}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VoiceChatControls;
