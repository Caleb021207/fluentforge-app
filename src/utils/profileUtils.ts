
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DataCache } from "./cacheUtils";
import { ExtendedUserProfile } from "@/types/school";

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
          role: 'student', // Default role
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
 * Clear all cache for a user
 */
export const clearUserCache = (userId: string) => {
  cache.remove(`profile-${userId}`);
};

/**
 * Checks if a user has a specific role
 */
export const checkUserRole = async (userId: string, role: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data?.role === role;
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false;
  }
};

/**
 * Updates a user's role
 */
export const updateUserRole = async (userId: string, role: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }
    
    // Clear cache
    clearUserCache(userId);
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};

/**
 * SECURITY: Role changes are now restricted to admin users only via RLS policies
 * Self-service role changes have been removed for security reasons
 */
