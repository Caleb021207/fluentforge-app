
import { supabase } from '@/integrations/supabase/client';
import { UsageStats } from '@/types/supabase';

export const updateTextChatCount = async (userId: string, increment: number = 1): Promise<UsageStats | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's stats exist
    const { data: existingStats, error: fetchError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', fetchError);
      return null;
    }
    
    if (existingStats) {
      // Update existing stats
      const { data: updatedStats, error: updateError } = await supabase
        .from('usage_stats')
        .update({
          text_chat_count: existingStats.text_chat_count + increment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStats.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating usage stats:', updateError);
        return null;
      }
      
      return updatedStats as UsageStats;
    } else {
      // Create new stats
      const { data: newStats, error: createError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          date: today,
          text_chat_count: increment,
          voice_minutes_used: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating usage stats:', createError);
        return null;
      }
      
      return newStats as UsageStats;
    }
  } catch (error) {
    console.error('Error in updateTextChatCount:', error);
    return null;
  }
};

export const updateVoiceMinutesUsed = async (userId: string, minutes: number): Promise<UsageStats | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's stats exist
    const { data: existingStats, error: fetchError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', fetchError);
      return null;
    }
    
    if (existingStats) {
      // Update existing stats
      const { data: updatedStats, error: updateError } = await supabase
        .from('usage_stats')
        .update({
          voice_minutes_used: existingStats.voice_minutes_used + minutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStats.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating usage stats:', updateError);
        return null;
      }
      
      return updatedStats as UsageStats;
    } else {
      // Create new stats
      const { data: newStats, error: createError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          date: today,
          text_chat_count: 0,
          voice_minutes_used: minutes
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating usage stats:', createError);
        return null;
      }
      
      return newStats as UsageStats;
    }
  } catch (error) {
    console.error('Error in updateVoiceMinutesUsed:', error);
    return null;
  }
};

export const getRemainingVoiceMinutes = async (userId: string): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First check if the user is enrolled in any classroom
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('student_classrooms')
      .select('classroom_id')
      .eq('student_id', userId);
    
    if (enrollmentError) {
      console.error('Error checking classroom enrollment:', enrollmentError);
      return 0;
    }
    
    const isEnrolled = enrollments && enrollments.length > 0;
    
    // If not enrolled, they only get browser TTS (no minutes limit to track)
    if (!isEnrolled) {
      return 0;
    }
    
    // If enrolled, check usage and return remaining minutes (out of 5)
    const { data: usage, error: usageError } = await supabase
      .from('usage_stats')
      .select('voice_minutes_used')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching voice usage:', usageError);
      return 0;
    }
    
    const usedMinutes = usage?.voice_minutes_used || 0;
    return Math.max(0, 5 - usedMinutes);
  } catch (error) {
    console.error('Error in getRemainingVoiceMinutes:', error);
    return 0;
  }
};

export const checkHasVoiceAccess = async (userId: string): Promise<boolean> => {
  try {
    // Check if the user is enrolled in any classroom
    const { data, error } = await supabase
      .from('student_classrooms')
      .select('id')
      .eq('student_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking classroom enrollment:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkHasVoiceAccess:', error);
    return false;
  }
};
