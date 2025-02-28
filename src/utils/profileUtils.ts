
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Creates a user profile if it doesn't exist
 */
export const ensureUserProfile = async (userId: string) => {
  try {
    // Check if profile exists
    const { data: profile, error: queryError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (queryError && queryError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          display_name: '',
          learning_goal: '',
          target_level: 'B2',
          target_date: null,
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      }
    } else if (queryError) {
      console.error('Error checking user profile:', queryError);
    }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
  }
};

/**
 * Fetches the user profile data
 */
export const getUserProfile = async (userId: string) => {
  try {
    await ensureUserProfile(userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

/**
 * Updates a user profile
 */
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    await ensureUserProfile(userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

/**
 * Creates a lesson progress entry if it doesn't exist
 */
export const ensureLessonProgress = async (userId: string, level: string, lessonId: number) => {
  try {
    // Check if progress entry exists
    const { data: progress, error: queryError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('level', level)
      .eq('lesson_id', lessonId)
      .single();

    if (queryError && queryError.code === 'PGRST116') {
      // Progress doesn't exist, create it
      const { error: insertError } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: userId,
          level: level,
          lesson_id: lessonId,
          progress: 0,
          completed: false,
          xp_earned: 0
        });

      if (insertError) {
        console.error('Error creating lesson progress:', insertError);
      }
    } else if (queryError) {
      console.error('Error checking lesson progress:', queryError);
    }

    return progress;
  } catch (error) {
    console.error('Error in ensureLessonProgress:', error);
    return null;
  }
};

/**
 * Updates a lesson progress
 */
export const updateLessonProgress = async (
  userId: string, 
  level: string, 
  lessonId: number, 
  updates: {
    progress?: number,
    completed?: boolean,
    xp_earned?: number
  }
) => {
  try {
    await ensureLessonProgress(userId, level, lessonId);
    
    const { data, error } = await supabase
      .from('lesson_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('level', level)
      .eq('lesson_id', lessonId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lesson progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateLessonProgress:', error);
    return null;
  }
};

/**
 * Gets all lesson progress for a user
 */
export const getAllLessonProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllLessonProgress:', error);
    return [];
  }
};
