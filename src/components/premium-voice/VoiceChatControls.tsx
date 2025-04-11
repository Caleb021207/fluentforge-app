
import { Mic, MicOff, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { useState, useEffect } from "react";

interface VoiceChatControlsProps {
  startConversation: () => void;
  isConversationActive: () => boolean;
  weeklyTimeRemaining: number | null;
  sessionStatus: 'available' | 'active' | 'cooldown';
  formatTime: (seconds: number) => string;
}

const VoiceChatControls = ({ 
  startConversation, 
  isConversationActive, 
  weeklyTimeRemaining, 
  sessionStatus,
  formatTime
}: VoiceChatControlsProps) => {
  const { t } = useLocalization();
  const [ttsSupported, setTtsSupported] = useState(true);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined') {
      setTtsSupported('speechSynthesis' in window);
    }
  }, []);

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
        
        {weeklyTimeRemaining !== null && weeklyTimeRemaining > 0 && (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            <Clock className="h-4 w-4" />
            <span>{formatTime(weeklyTimeRemaining)} {t("remaining")}</span>
          </div>
        )}
        
        {!ttsSupported && (
          <div className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <span>{t("speechSynthesisNotSupported")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatControls;
