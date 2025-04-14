
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/utils/timeUtils";

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
  const timerIdRef = useRef<number | null>(null);
  const hasExpiredRef = useRef<boolean>(false);

  useEffect(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    
    hasExpiredRef.current = false;
    
    if (isConversationActive() && weeklyTimeRemaining !== null) {
      setTimerValue(weeklyTimeRemaining);
      
      timerIdRef.current = window.setInterval(() => {
        setTimerValue(prev => {
          if (prev === null || prev <= 0) {
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true;
              if (timerIdRef.current !== null) {
                clearInterval(timerIdRef.current);
                timerIdRef.current = null;
              }
              onTimeExpired();
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit10MinReached")
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerValue(null);
    }
    
    return () => {
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isConversationActive(), weeklyTimeRemaining, onTimeExpired, t, toast]);

  return {
    timerValue,
    formatTimer: formatTime
  };
};
