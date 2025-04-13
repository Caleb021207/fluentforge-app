
import { supabase } from "@/integrations/supabase/client";
import { getUserTier, getWeeklyTimeLimit } from "./tierUtils";

/**
 * Format seconds into minutes:seconds display
 */
export const formatTime = (seconds: number): string => {
  if (seconds <= 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get the start of the current week (Monday 6 AM UTC)
 */
export const getCurrentWeekStart = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Calculate days to subtract to get to the most recent Monday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Set to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysToMonday);
  
  // Set to 6:00 AM UTC
  monday.setUTCHours(6, 0, 0, 0);
  
  // If current time is before Monday 6 AM, use previous week's Monday
  if (now < monday) {
    monday.setUTCDate(monday.getUTCDate() - 7);
  }
  
  return monday;
};

/**
 * Calculate the remaining weekly time for a user's premium voice sessions
 */
export const calculateRemainingWeeklyTime = async (userId: string): Promise<number> => {
  try {
    // Get user's tier
    const tier = await getUserTier(userId);
    const maxWeeklyTime = getWeeklyTimeLimit(tier);
    
    if (maxWeeklyTime <= 0) {
      return 0; // No time allocation for this tier
    }
    
    // Get the current week's start (Monday 6 AM UTC)
    const weekStart = getCurrentWeekStart();
    
    // Query sessions from this week
    const { data, error } = await supabase
      .from('premium_voice_chat_sessions')
      .select('session_start, session_end')
      .eq('user_id', userId)
      .gte('session_start', weekStart.toISOString())
      .order('session_start', { ascending: false });
    
    if (error) {
      console.error('Error calculating weekly time:', error);
      return maxWeeklyTime; // Return max time on error to be safe
    }
    
    // Calculate used time
    let usedTime = 0;
    
    for (const session of data || []) {
      const startTime = new Date(session.session_start);
      let endTime;
      
      if (session.session_end) {
        endTime = new Date(session.session_end);
      } else {
        // For ongoing sessions, use current time
        endTime = new Date();
      }
      
      // Calculate session duration in seconds
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      usedTime += durationSeconds;
    }
    
    // Calculate remaining time
    const remainingTime = Math.max(0, maxWeeklyTime - usedTime);
    return remainingTime;
  } catch (error) {
    console.error('Error in calculateRemainingWeeklyTime:', error);
    return 0; // Return 0 on error to be safe
  }
};

/**
 * Format cooldown time for display
 */
export const formatCooldownTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(seconds / 86400);
  return `${days} day${days !== 1 ? 's' : ''}`;
};

/**
 * Calculate time until next weekly reset
 */
export const calculateTimeUntilReset = (): number => {
  const now = new Date();
  const nextMonday = new Date(getCurrentWeekStart());
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
};

/**
 * Format the reset date for display
 */
export const formatResetDate = (): string => {
  const nextMonday = new Date(getCurrentWeekStart());
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  
  return nextMonday.toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  });
};
