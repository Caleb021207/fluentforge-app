
import { useState, useEffect, useCallback } from "react";

interface VoiceChatTimerProps {
  isConversationActive: () => boolean;
  weeklyTimeRemaining: number | null;
  onTimeExpired: () => void;
  t: (key: string) => string;
}

export const useVoiceChatTimer = ({
  isConversationActive,
  weeklyTimeRemaining,
  onTimeExpired,
  t
}: VoiceChatTimerProps) => {
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConversationActive() && weeklyTimeRemaining !== null) {
      // Convert minutes to seconds
      setTimerValue(weeklyTimeRemaining * 60);
      
      // Start the timer
      const interval = setInterval(() => {
        setTimerValue((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Time's up
            clearInterval(interval);
            onTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      // Stop the timer if conversation is not active
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      if (!isConversationActive()) {
        setTimerValue(null);
      }
    }
  }, [isConversationActive, weeklyTimeRemaining, onTimeExpired]);

  const formatTimer = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timerValue,
    formatTimer
  };
};
