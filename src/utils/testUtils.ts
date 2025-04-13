
import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a batch of test access codes for each tier level
 * This is a utility function for testing purposes only
 */
export const generateTestAccessCodes = async (quantity: number = 1): Promise<{
  tier2Codes: string[];
  tier3Codes: string[];
  tier4Codes: string[];
  tier5Codes: string[];
}> => {
  const tier2Codes: string[] = [];
  const tier3Codes: string[] = [];
  const tier4Codes: string[] = [];
  const tier5Codes: string[] = [];
  
  const generateForTier = async (tier: number, targetArray: string[]) => {
    for (let i = 0; i < quantity; i++) {
      // Format: TIER{N}-TEST-{random}
      const code = `TIER${tier}-TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('access_codes')
        .insert({
          code: code,
          tier: tier,
          generated_by: 'test-util',
          is_used: false
        })
        .select()
        .single();
        
      if (data && !error) {
        targetArray.push(code);
      } else {
        console.error(`Error generating tier ${tier} code:`, error);
      }
    }
  };
  
  // Generate codes for each tier
  await generateForTier(2, tier2Codes);
  await generateForTier(3, tier3Codes);
  await generateForTier(4, tier4Codes);
  await generateForTier(5, tier5Codes);
  
  return {
    tier2Codes,
    tier3Codes,
    tier4Codes,
    tier5Codes
  };
};

/**
 * Checks if a user has admin access
 * This is a simple check based on email containing 'admin'
 */
export const checkAdminAccess = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    const email = data.session.user.email;
    return email?.includes('admin') || false;
  }
  return false;
};
