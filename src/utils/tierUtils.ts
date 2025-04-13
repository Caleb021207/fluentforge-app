
import { supabase } from "@/integrations/supabase/client";

// Define time limits based on user tier (in seconds)
export const TIER_TIME_LIMITS = {
  1: 0,        // Tier 1: No premium voice
  2: 600,      // Tier 2: 10 minutes weekly
  3: 1200,     // Tier 3: 20 minutes weekly
  4: 1800,     // Tier 4: 30 minutes weekly
  5: 3600      // Tier 5: 60 minutes weekly
};

/**
 * Get the tier description for display purposes
 */
export const getTierDescription = (tier: number, t: (key: string) => string): string => {
  switch (tier) {
    case 1:
      return t("tierFree");
    case 2:
      return t("tierBasic");
    case 3:
      return t("tierStandard");
    case 4:
      return t("tierPremium");
    case 5:
      return t("tierUnlimited");
    default:
      return t("tierFree");
  }
};

/**
 * Check if a user has access to premium voice features based on their tier
 */
export const hasPremiumVoiceAccess = (tier: number): boolean => {
  return tier >= 2; // Tiers 2-5 have premium voice access
};

/**
 * Get weekly time limit in seconds based on user tier
 */
export const getWeeklyTimeLimit = (tier: number): number => {
  return TIER_TIME_LIMITS[tier as keyof typeof TIER_TIME_LIMITS] || 0;
};

/**
 * Redeem an access code and update the user's tier
 */
export const redeemAccessCode = async (code: string, userId: string): Promise<{
  success: boolean;
  message: string;
  tier?: number;
}> => {
  try {
    // Start a transaction to ensure atomicity
    const { data: codeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (codeError) {
      if (codeError.code === 'PGRST116') {
        return { success: false, message: 'invalidOrUsedCode' };
      }
      return { success: false, message: 'databaseError' };
    }

    if (!codeData) {
      return { success: false, message: 'invalidOrUsedCode' };
    }

    // Mark the code as used
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString()
      })
      .eq('id', codeData.id);

    if (updateError) {
      console.error('Error updating access code:', updateError);
      return { success: false, message: 'codeUpdateError' };
    }

    // Update the user's tier
    const { error: userUpdateError } = await supabase
      .from('user_profiles')
      .update({ tier: codeData.tier })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user tier:', userUpdateError);
      return { success: false, message: 'userUpdateError' };
    }

    return { 
      success: true, 
      message: 'codeRedeemSuccess', 
      tier: codeData.tier 
    };
  } catch (error) {
    console.error('Error redeeming access code:', error);
    return { success: false, message: 'unexpectedError' };
  }
};

/**
 * Get user's current tier
 */
export const getUserTier = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user tier:', error);
      return 1; // Default to free tier on error
    }

    return data?.tier || 1;
  } catch (error) {
    console.error('Error in getUserTier:', error);
    return 1; // Default to free tier on error
  }
};

/**
 * Check if a user needs to upgrade their tier
 */
export const shouldUpgradeTier = async (userId: string): Promise<boolean> => {
  const tier = await getUserTier(userId);
  return tier === 1; // User should upgrade if they're on the free tier
};

/**
 * Get remaining minutes for a tier
 */
export const getRemainingMinutes = (tier: number, usedSeconds: number): number => {
  const totalSeconds = getWeeklyTimeLimit(tier);
  const remainingSeconds = Math.max(0, totalSeconds - usedSeconds);
  return Math.ceil(remainingSeconds / 60);
};
