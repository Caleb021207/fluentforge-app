
import { supabase } from '@/integrations/supabase/client';
import { UsageStats } from '@/types/supabase';

export async function checkHasVoiceAccess(userId: string): Promise<boolean> {
  try {
    // First check if the user is part of any classroom
    const { data, error } = await supabase
      .from('student_classrooms')
      .select('*')
      .eq('student_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking enrollment:', error);
      return false;
    }

    // If the user is enrolled in any classroom, they have access
    return !!data;
  } catch (error) {
    console.error('Error in checkHasVoiceAccess:', error);
    return false;
  }
}

export async function updateVoiceMinutesUsed(userId: string, minutes: number): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's an existing entry for today
    const { data: existing, error: fetchError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', fetchError);
      return false;
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('usage_stats')
        .update({
          voice_minutes_used: (existing as UsageStats).voice_minutes_used + minutes
        })
        .eq('id', (existing as UsageStats).id);

      if (updateError) {
        console.error('Error updating voice minutes:', updateError);
        return false;
      }
    } else {
      // Create new record for today
      const { error: insertError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          date: today,
          voice_minutes_used: minutes,
          text_chat_count: 0
        });

      if (insertError) {
        console.error('Error creating voice usage record:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateVoiceMinutesUsed:', error);
    return false;
  }
}

export async function incrementTextChatCount(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's an existing entry for today
    const { data: existing, error: fetchError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', fetchError);
      return false;
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('usage_stats')
        .update({
          text_chat_count: (existing as UsageStats).text_chat_count + 1
        })
        .eq('id', (existing as UsageStats).id);

      if (updateError) {
        console.error('Error updating text chat count:', updateError);
        return false;
      }
    } else {
      // Create new record for today
      const { error: insertError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          date: today,
          text_chat_count: 1,
          voice_minutes_used: 0
        });

      if (insertError) {
        console.error('Error creating text chat usage record:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in incrementTextChatCount:', error);
    return false;
  }
}

export async function getRemainingVoiceMinutes(userId: string): Promise<number> {
  try {
    // Daily limit is 30 minutes
    const DAILY_LIMIT = 30;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's usage
    const { data, error } = await supabase
      .from('usage_stats')
      .select('voice_minutes_used')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching voice minutes used:', error);
      return DAILY_LIMIT; // Assume no usage if there's an error
    }

    if (!data) {
      return DAILY_LIMIT; // No usage record for today
    }

    const minutesUsed = (data as UsageStats).voice_minutes_used || 0;
    return Math.max(0, DAILY_LIMIT - minutesUsed);
  } catch (error) {
    console.error('Error in getRemainingVoiceMinutes:', error);
    return 0; // Return 0 on error (no remaining minutes)
  }
}

export async function getHasClassroomAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('student_classrooms')
      .select('id')
      .eq('student_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking classroom access:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in getHasClassroomAccess:', error);
    return false;
  }
}
