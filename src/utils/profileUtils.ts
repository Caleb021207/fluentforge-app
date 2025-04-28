import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DataCache } from "./cacheUtils";

// Cache instance
const cache = DataCache.getInstance();
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }
    } else if (queryError) {
      console.error('Error checking user profile:', queryError);
      throw new Error(`Failed to check profile: ${queryError.message}`);
    }
    
    // Clear any cached profile data as it's been updated
    cache.remove(`profile-${userId}`);
    
    return true;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    throw error;
  }
};

/**
 * Fetches the user profile data with caching
 */
export const getUserProfile = async (userId: string) => {
  try {
    // Check cache first
    const cacheKey = `profile-${userId}`;
    const cachedProfile = cache.get(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }
    
    // Not in cache, ensure profile exists
    await ensureUserProfile(userId);
    
    // Fetch the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    // Cache the result if successful
    if (data) {
      cache.set(cacheKey, data, PROFILE_CACHE_TTL);
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
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
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    // Clear cache for this user
    cache.remove(`profile-${userId}`);
    
    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

/**
 * Retry wrapper for database operations
 */
const withRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // If this isn't a network error, don't retry
      if (!(error instanceof Error) || !error.message.includes('network')) {
        throw error;
      }
      
      console.warn(`Retry attempt ${attempt + 1} after error:`, error);
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Creates a lesson progress entry if it doesn't exist with retry logic
 */
export const ensureLessonProgress = async (userId: string, level: string, lessonId: number) => {
  return withRetry(async () => {
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
          throw new Error(`Failed to create lesson progress: ${insertError.message}`);
        }
      } else if (queryError) {
        console.error('Error checking lesson progress:', queryError);
        throw new Error(`Failed to check lesson progress: ${queryError.message}`);
      }

      return progress;
    } catch (error) {
      console.error('Error in ensureLessonProgress:', error);
      throw error;
    }
  });
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
  return withRetry(async () => {
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
        throw new Error(`Failed to update lesson progress: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateLessonProgress:', error);
      throw error;
    }
  });
};

/**
 * Gets all lesson progress for a user with caching
 */
export const getAllLessonProgress = async (userId: string) => {
  return withRetry(async () => {
    try {
      // Check cache first
      const cacheKey = `lesson-progress-${userId}`;
      const cachedProgress = cache.get<any[]>(cacheKey);
      if (cachedProgress) {
        return cachedProgress;
      }
      
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        throw new Error(`Failed to fetch lesson progress: ${error.message}`);
      }

      // Cache the result
      const result = data || [];
      cache.set(cacheKey, result, 60000); // 1 minute cache, as this data changes frequently
      
      return result;
    } catch (error) {
      console.error('Error in getAllLessonProgress:', error);
      throw error;
    }
  });
};

/**
 * Clear all cache for a user
 */
export const clearUserCache = (userId: string) => {
  cache.remove(`profile-${userId}`);
  cache.remove(`lesson-progress-${userId}`);
};

/**
 * Checks if a user has a specific role
 */
export const checkUserRole = async (userId: string, role: 'student' | 'teacher'): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false;
  }
};

/**
 * Creates a utility to easily promote a user to teacher role
 */
export const promoteToTeacher = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('assign_role', {
      target_user_id: userId,
      role_name: 'teacher'
    });
    
    if (error) {
      console.error('Error promoting user to teacher:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in promoteToTeacher:', error);
    return false;
  }
};

/**
 * Function to make the currently logged in user a teacher
 * (for development and testing purposes)
 */
export const makeMyselfTeacher = async (): Promise<boolean> => {
  try {
    // Create a convenience RPC function for this
    const { data, error } = await supabase.rpc('make_myself_teacher');
    
    if (error) {
      console.error('Error making self teacher:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in makeMyselfTeacher:', error);
    return false;
  }
};
