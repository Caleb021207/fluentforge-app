
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
 * Calculate remaining monthly voice chat time for a user
 * The limit is 100 minutes per month (6,000 seconds)
 * Uses the new usage_tracking system for accurate tracking
 */
export const calculateRemainingMonthlyTime = async (userId: string): Promise<number> => {
  const MONTHLY_LIMIT_SECONDS = 6000; // 100 minutes in seconds
  
  try {
    // Get usage limits from the new system
    const { data: limits, error } = await supabase
      .from('student_usage_limits')
      .select('voice_minutes_monthly_limit, voice_minutes_used_current_month')
      .eq('student_id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching usage limits:", error);
      return MONTHLY_LIMIT_SECONDS; // Default to full time if error
    }
    
    if (!limits) {
      // Initialize limits for new user
      await supabase.rpc('initialize_student_usage_limits', {
        target_student_id: userId
      });
      return MONTHLY_LIMIT_SECONDS; // Return full time for new user
    }
    
    const remainingMinutes = limits.voice_minutes_monthly_limit - limits.voice_minutes_used_current_month;
    const remainingSeconds = Math.max(0, remainingMinutes * 60);
    
    console.log(`User ${userId} has ${limits.voice_minutes_used_current_month} minutes used, ${remainingMinutes} minutes remaining this month`);
    
    return remainingSeconds;
    
  } catch (error) {
    console.error("Error in calculateRemainingMonthlyTime:", error);
    return MONTHLY_LIMIT_SECONDS; // Default to full time if error
  }
};

/**
 * @deprecated Use calculateRemainingMonthlyTime instead
 * Calculate remaining weekly voice chat time for a user
 */
export const calculateRemainingWeeklyTime = async (userId: string): Promise<number> => {
  // Convert monthly limit to weekly for backward compatibility
  const monthlySeconds = await calculateRemainingMonthlyTime(userId);
  return Math.min(monthlySeconds, 600); // Cap at 10 minutes for backward compatibility
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
