
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the start of the current week in Central Time (UTC-6)
 * This is used to calculate weekly voice chat usage limits
 */
export const getCurrentWeekStart = (): Date => {
  const now = new Date();
  
  const centralTimeOffset = -6;
  const utcHours = now.getUTCHours();
  const centralHours = (utcHours + centralTimeOffset + 24) % 24;
  
  const dayOfWeek = now.getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  monday.setUTCHours(6 - centralTimeOffset, 0, 0, 0);
  
  if (now < monday) {
    monday.setUTCDate(monday.getUTCDate() - 7);
  }
  
  return monday;
};

/**
 * Format time in minutes and seconds (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Format cooldown time in days, hours, and minutes
 */
export const formatCooldownTime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

/**
 * Calculate remaining weekly voice chat time for a user
 */
export const calculateRemainingWeeklyTime = async (userId: string): Promise<number> => {
  const weekStart = getCurrentWeekStart();
  
  try {
    const { data, error } = await supabase
      .from('premium_voice_chat_sessions')
      .select('session_start, session_end')
      .eq('user_id', userId)
      .gte('session_start', weekStart.toISOString());
    
    if (error) {
      console.error("Error fetching session data:", error);
      return 600; // Default to 10 minutes (600 seconds)
    }
    
    if (!data || data.length === 0) {
      return 600;
    }
    
    let totalTimeUsedSeconds = 0;
    
    data.forEach(session => {
      const start = new Date(session.session_start).getTime();
      const end = session.session_end ? new Date(session.session_end).getTime() : Date.now();
      const sessionDuration = Math.floor((end - start) / 1000);
      totalTimeUsedSeconds += sessionDuration;
    });
    
    const remainingTime = Math.max(0, 600 - totalTimeUsedSeconds);
    return remainingTime;
    
  } catch (error) {
    console.error("Error in calculateRemainingWeeklyTime:", error);
    return 600;
  }
};
