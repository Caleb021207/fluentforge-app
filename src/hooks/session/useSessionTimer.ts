
import { useState, useEffect } from "react";
import { calculateRemainingWeeklyTime, getCurrentWeekStart } from "@/utils/voiceChatUtils";
import { supabase } from "@/integrations/supabase/client";

export const useSessionTimer = (userId: string | null) => {
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number | null>(null);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null);

  const updateTimeRemaining = async () => {
    if (!userId) return;
    
    const remaining = await calculateRemainingWeeklyTime(userId);
    setWeeklyTimeRemaining(remaining);
    
    if (remaining <= 0) {
      const now = new Date();
      const nextMonday6AM = new Date(getCurrentWeekStart());
      nextMonday6AM.setUTCDate(nextMonday6AM.getUTCDate() + 7);
      const cooldownRemaining = Math.floor((nextMonday6AM.getTime() - now.getTime()) / 1000);
      setCooldownTimeRemaining(cooldownRemaining);
    } else {
      setCooldownTimeRemaining(null);
    }
  };

  return {
    weeklyTimeRemaining,
    cooldownTimeRemaining,
    setWeeklyTimeRemaining,
    updateTimeRemaining,
    setCooldownTimeRemaining
  };
};
