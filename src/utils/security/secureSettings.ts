/**
 * Secure settings utilities for managing application configuration
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Retrieves a secure setting from the database
 */
export const getSecureSetting = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error || !data) {
      console.warn(`Setting '${key}' not found`);
      return null;
    }

    return data.setting_value;
  } catch (error) {
    console.error('Error retrieving secure setting:', error);
    return null;
  }
};

/**
 * Sets a secure setting in the database (admin only)
 */
export const setSecureSetting = async (
  key: string, 
  value: string, 
  encrypted: boolean = false
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        encrypted,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error setting secure setting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting secure setting:', error);
    return false;
  }
};

/**
 * Rate limiting utility
 */
export const checkRateLimit = async (
  actionType: string,
  maxRequests: number = 10,
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_action_type: actionType,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
};

/**
 * Security audit logging
 */
export const logSecurityEvent = async (
  action: string,
  details: Record<string, any> = {},
  success: boolean = true
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user?.id || null,
        action,
        details,
        success,
        ip_address: null, // Client-side can't get real IP
        user_agent: navigator.userAgent
      });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};