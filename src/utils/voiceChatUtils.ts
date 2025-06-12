
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
 * The limit is 10 minutes (600 seconds) per week
 * Note: Since premium_voice_chat_sessions table doesn't exist, we'll use api_calls_tracking
 */
export const calculateRemainingWeeklyTime = async (userId: string): Promise<number> => {
  const weekStart = getCurrentWeekStart();
  const WEEKLY_LIMIT_SECONDS = 600; // 10 minutes in seconds
  
  try {
    // Use api_calls_tracking to estimate voice usage
    const { data, error } = await supabase
      .from('api_calls_tracking')
      .select('created_at')
      .eq('user_id', userId)
      .eq('service', 'premium_voice')
      .gte('created_at', weekStart.toISOString());
    
    if (error) {
      console.error("Error fetching session data:", error);
      return WEEKLY_LIMIT_SECONDS; // Default to full time if error
    }
    
    if (!data || data.length === 0) {
      return WEEKLY_LIMIT_SECONDS; // No sessions yet
    }
    
    // Estimate 30 seconds per voice session (this is a rough estimate)
    const estimatedTimeUsed = data.length * 30;
    const cappedTimeUsed = Math.min(estimatedTimeUsed, WEEKLY_LIMIT_SECONDS);
    
    // Calculate remaining time
    const remainingTime = Math.max(0, WEEKLY_LIMIT_SECONDS - cappedTimeUsed);
    console.log(`User ${userId} has estimated ${cappedTimeUsed}s used, remaining: ${remainingTime}s this week`);
    
    return remainingTime;
    
  } catch (error) {
    console.error("Error in calculateRemainingWeeklyTime:", error);
    return WEEKLY_LIMIT_SECONDS; // Default to full time if error
  }
};

/**
 * Schedule a cleanup of abandoned premium voice sessions
 * This should be called at regular intervals to prevent orphaned sessions
 */
export const scheduleVoiceSessionCleanup = async () => {
  try {
    // Call the edge function to clean up abandoned sessions
    const { data, error } = await supabase.functions.invoke('cleanup-voice-sessions');
    
    if (error) {
      console.error("Failed to run session cleanup:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error scheduling voice session cleanup:", error);
    return { success: false, error };
  }
};
