
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/utils/voiceChatUtils";

interface UseVoiceChatTimerProps {
  isConversationActive: () => boolean;
  weeklyTimeRemaining: number | null;
  onTimeExpired: () => void;
  t: (key: string, options?: any) => string;
}

export const useVoiceChatTimer = ({
  isConversationActive,
  weeklyTimeRemaining,
  onTimeExpired,
  t
}: UseVoiceChatTimerProps) => {
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let timerId: number | null = null;
    
    if (isConversationActive() && weeklyTimeRemaining !== null) {
      setTimerValue(weeklyTimeRemaining);
      
      timerId = window.setInterval(() => {
        setTimerValue(prev => {
          if (prev === null || prev <= 0) {
            if (timerId) clearInterval(timerId);
            onTimeExpired();
            toast({
              title: t("voiceChatEnded"),
              description: t("timeLimit10MinReached")
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerValue(null);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isConversationActive(), weeklyTimeRemaining]);

  return {
    timerValue,
    formatTimer: formatTime
  };
};
