
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Clock } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { SessionStatus } from "./types";

interface VoiceControlsProps {
  isConversationActive: () => boolean;
  startConversation: () => void;
  endConversation: () => void;
  sessionStatus: SessionStatus;
  voiceChatTimeRemaining: number | null;
  formatTime: (seconds: number) => string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isConversationActive,
  startConversation,
  endConversation,
  sessionStatus,
  voiceChatTimeRemaining,
  formatTime
}) => {
  const { t } = useLocalization();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button 
          onClick={isConversationActive() ? endConversation : startConversation} 
          variant={isConversationActive() ? "destructive" : "default"} 
          className="bg-lingua-primary hover:bg-lingua-primary/90" 
          disabled={sessionStatus === 'cooldown'}>
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
        
        {voiceChatTimeRemaining !== null && voiceChatTimeRemaining > 0 && (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            <Clock className="h-4 w-4" />
            <span>{formatTime(voiceChatTimeRemaining)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceControls;
