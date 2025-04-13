
import { supabase } from "@/integrations/supabase/client";
import { generateRandomCode } from "@/components/admin/utils/codeGeneratorUtils";

/**
 * Check if the current user has admin access
 */
export const checkAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (error || !profile) return false;
    
    return !!profile.is_admin;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};

/**
 * Generate test access codes for each tier
 */
export const generateTestAccessCodes = async (quantity: number = 1): Promise<{
  tier2Codes: string[];
  tier3Codes: string[];
  tier4Codes: string[];
  tier5Codes: string[];
}> => {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const tier2Codes: string[] = [];
    const tier3Codes: string[] = [];
    const tier4Codes: string[] = [];
    const tier5Codes: string[] = [];
    
    // Generate codes for each tier
    for (let i = 0; i < quantity; i++) {
      // Tier 2 codes
      const tier2Code = generateRandomCode(8);
      tier2Codes.push(tier2Code);
      
      // Tier 3 codes
      const tier3Code = generateRandomCode(8);
      tier3Codes.push(tier3Code);
      
      // Tier 4 codes
      const tier4Code = generateRandomCode(8);
      tier4Codes.push(tier4Code);
      
      // Tier 5 codes
      const tier5Code = generateRandomCode(8);
      tier5Codes.push(tier5Code);
    }
    
    // Insert all codes into the database
    const codesToInsert = [
      ...tier2Codes.map(code => ({ code, tier: 2, is_used: false })),
      ...tier3Codes.map(code => ({ code, tier: 3, is_used: false })),
      ...tier4Codes.map(code => ({ code, tier: 4, is_used: false })),
      ...tier5Codes.map(code => ({ code, tier: 5, is_used: false }))
    ];
    
    const { error } = await supabase
      .from('access_codes')
      .insert(codesToInsert);
      
    if (error) {
      console.error("Error inserting test access codes:", error);
      throw error;
    }
    
    return {
      tier2Codes,
      tier3Codes,
      tier4Codes,
      tier5Codes
    };
  } catch (error) {
    console.error("Error generating test access codes:", error);
    throw error;
  }
};

/**
 * Set a user as admin (for testing purposes)
 */
export const setUserAsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('id', userId);
      
    if (error) {
      console.error("Error setting user as admin:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in setUserAsAdmin:", error);
    return false;
  }
};
