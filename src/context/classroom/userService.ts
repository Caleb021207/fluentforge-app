
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserSettings, UsageStats } from '@/types/supabase';

export async function fetchUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return (data as UserSettings).role;
  } catch (error) {
    console.error('Error in fetchUserRole:', error);
    return null;
  }
}

export async function setUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setUserRole:', error);
    return false;
  }
}

export async function fetchUsageStats(userId: string): Promise<UsageStats | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', error);
      return null;
    }

    if (data) {
      return data as UsageStats;
    } else {
      // Create today's usage stats if it doesn't exist
      const { data: newStats, error: createError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          date: today,
          text_chat_count: 0,
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
    console.error('Error in fetchUsageStats:', error);
    return null;
  }
}

export async function fetchStudentStats(studentId: string): Promise<UsageStats | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', studentId)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching student stats:', error);
      return null;
    }

    return data as UsageStats;
  } catch (error) {
    console.error('Error in fetchStudentStats:', error);
    return null;
  }
}
