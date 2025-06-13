
import { supabase } from "@/integrations/supabase/client";
import { ExtendedUserProfile } from "@/types/school";

/**
 * Get extended user profile with school and district information
 */
export const getExtendedUserProfile = async (userId: string): Promise<ExtendedUserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        school:schools(
          id,
          name,
          district,
          address,
          phone,
          email,
          principal_name
        ),
        district_user:district_users(
          district_id,
          role,
          district:school_districts(
            id,
            name,
            code
          )
        )
      `)
      .eq('id', userId)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (error) {
      console.error('Error fetching extended profile:', error);
      return null;
    }

    return profile as ExtendedUserProfile;
  } catch (error) {
    console.error('Error in getExtendedUserProfile:', error);
    return null;
  }
};
