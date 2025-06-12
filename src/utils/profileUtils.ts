
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
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (queryError && queryError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
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
      .from('profiles')
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
      .from('profiles')
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
 * Clear all cache for a user
 */
export const clearUserCache = (userId: string) => {
  cache.remove(`profile-${userId}`);
};

/**
 * Checks if a user has a specific role based on classroom ownership
 */
export const checkUserRole = async (userId: string, role: 'student' | 'teacher'): Promise<boolean> => {
  try {
    if (role === 'teacher') {
      // Check if user has created any classrooms
      const { data, error } = await supabase
        .from('classroom_codes')
        .select('id')
        .eq('teacher_id', userId)
        .limit(1);
        
      if (error) {
        console.error('Error checking teacher role:', error);
        return false;
      }
      
      return !!data && data.length > 0;
    } else {
      // For students, check if they're in any classroom
      const { data, error } = await supabase
        .from('classroom_memberships')
        .select('id')
        .eq('student_id', userId)
        .limit(1);
        
      if (error) {
        console.error('Error checking student role:', error);
        return false;
      }
      
      return !!data && data.length > 0;
    }
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false;
  }
};

/**
 * Creates a utility to easily promote a user to teacher role by creating a classroom
 */
export const promoteToTeacher = async (userId: string): Promise<boolean> => {
  try {
    // Create a default classroom to make the user a teacher
    const { data, error } = await supabase.rpc('create_classroom', {
      class_name: 'My First Class'
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
    // Create a classroom to become a teacher
    const { data, error } = await supabase.rpc('create_classroom', {
      class_name: 'Test Classroom'
    });
    
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
