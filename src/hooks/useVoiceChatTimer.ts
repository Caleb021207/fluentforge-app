
import { useState, useEffect, useRef } from "react";
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
  const timerIdRef = useRef<number | null>(null);
  const hasExpiredRef = useRef<boolean>(false);

  useEffect(() => {
    // Clean up the previous timer if exists
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    
    // Reset expiration flag when starting a new timer
    hasExpiredRef.current = false;
    
    if (isConversationActive() && weeklyTimeRemaining !== null) {
      setTimerValue(weeklyTimeRemaining);
      
      timerIdRef.current = window.setInterval(() => {
        setTimerValue(prev => {
          if (prev === null || prev <= 0) {
            // Only trigger expiration once
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true;
              // Clean up timer
              if (timerIdRef.current !== null) {
                clearInterval(timerIdRef.current);
                timerIdRef.current = null;
              }
              
              // Call the expiration callback
              onTimeExpired();
              
              // Show toast notification
              toast({
                title: t("voiceChatEnded"),
                description: t("timeLimit10MinReached") // Updated to 10 minutes
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
    
    // Cleanup function
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
