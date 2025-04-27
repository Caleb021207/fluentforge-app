
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
 */
export const calculateRemainingWeeklyTime = async (userId: string): Promise<number> => {
  const weekStart = getCurrentWeekStart();
  const WEEKLY_LIMIT_SECONDS = 600; // 10 minutes in seconds
  
  try {
    // First, clean up any abandoned sessions (no end time but started more than 15 minutes ago)
    const now = new Date();
    const { data: abandonedSessions } = await supabase
      .from('premium_voice_chat_sessions')
      .select('id, session_start')
      .eq('user_id', userId)
      .is('session_end', null)
      .lt('session_start', new Date(now.getTime() - 15 * 60 * 1000).toISOString());
      
    if (abandonedSessions && abandonedSessions.length > 0) {
      console.log(`Found ${abandonedSessions.length} abandoned sessions for user ${userId}`);
      
      // Close abandoned sessions with max 10 min duration
      for (const session of abandonedSessions) {
        const sessionStart = new Date(session.session_start);
        const maxEnd = new Date(sessionStart.getTime() + 10 * 60 * 1000);
        const sessionEnd = maxEnd < now ? maxEnd : now;
        
        // Update each session individually instead of using upsert with an array
        await supabase
          .from('premium_voice_chat_sessions')
          .update({ session_end: sessionEnd.toISOString() })
          .eq('id', session.id);
      }
    }
    
    // Now get all completed sessions for this week
    const { data, error } = await supabase
      .from('premium_voice_chat_sessions')
      .select('session_start, session_end')
      .eq('user_id', userId)
      .gte('session_start', weekStart.toISOString())
      .not('session_end', 'is', null); // Only count sessions that have ended
    
    if (error) {
      console.error("Error fetching session data:", error);
      return WEEKLY_LIMIT_SECONDS; // Default to full time if error
    }
    
    if (!data || data.length === 0) {
      return WEEKLY_LIMIT_SECONDS; // No sessions yet
    }
    
    let totalTimeUsedSeconds = 0;
    
    data.forEach(session => {
      if (!session.session_end) return; // Skip any sessions without end time
      
      const start = new Date(session.session_start).getTime();
      const end = new Date(session.session_end).getTime();
      const sessionDuration = Math.max(0, Math.floor((end - start) / 1000));
      
      // Cap individual sessions at 10 minutes (600 seconds)
      const cappedSessionDuration = Math.min(sessionDuration, 600);
      totalTimeUsedSeconds += cappedSessionDuration;
    });
    
    // Cap total time at weekly limit
    totalTimeUsedSeconds = Math.min(totalTimeUsedSeconds, WEEKLY_LIMIT_SECONDS);
    
    // Calculate remaining time
    const remainingTime = Math.max(0, WEEKLY_LIMIT_SECONDS - totalTimeUsedSeconds);
    console.log(`User ${userId} has used ${totalTimeUsedSeconds}s, remaining: ${remainingTime}s this week`);
    
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
