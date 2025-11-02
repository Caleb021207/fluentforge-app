
import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedUserProfile } from "@/types/school";

interface ProfileDataState {
  user: SupabaseUser | null;
  profile: ExtendedUserProfile | null;
  isLoading: boolean;
  authError: boolean;
  debugInfo: any;
}

export const useProfileData = () => {
  const [state, setState] = useState<ProfileDataState>({
    user: null,
    profile: null,
    isLoading: true,
    authError: false,
    debugInfo: null
  });

  const fetchUserData = async (showLoadingState = true) => {
    if (showLoadingState) {
      setState(prev => ({ ...prev, isLoading: true }));
    }
    
    try {
      console.log('🔍 useProfileData: Starting fetchUserData');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Auth error:', error);
        setState(prev => ({ 
          ...prev, 
          authError: true, 
          isLoading: false 
        }));
        return;
      }
      
      console.log('✅ User found:', user?.id, user?.email);
      setState(prev => ({ ...prev, user }));
      
      if (user) {
        console.log('🔍 useProfileData: Fetching profile for user:', user.id);
        
        try {
          // Fetch basic profile first
          const { data: basicProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          console.log('📋 Profile query result:', basicProfile, 'Error:', profileError);
          
          if (profileError) {
            console.log('❌ No profile found, profileError:', profileError);
            setState(prev => ({
              ...prev,
              profile: null,
              debugInfo: {
                profileError,
                userId: user.id,
                step: 'no_profile_found'
              },
              isLoading: false
            }));
            return;
          }

          console.log('✅ Basic profile found:', basicProfile);
          console.log('👤 User role:', basicProfile.role);

          // Build extended profile
          let extendedProfile: ExtendedUserProfile = {
            ...basicProfile,
            school: null,
            district_associations: []
          };

          // If user is district admin, fetch district associations
          if (basicProfile.role === 'district') {
            console.log('🏛️ Fetching district associations for district admin');
            const { data: districtAssociations, error: districtError } = await supabase
              .from('district_users')
              .select(`
                *,
                school_districts (
                  id,
                  name,
                  code,
                  created_at,
                  updated_at
                )
              `)
              .eq('user_id', user.id);

            console.log('🏛️ District associations result:', districtAssociations, 'Error:', districtError);

            if (!districtError && districtAssociations) {
              extendedProfile.district_associations = districtAssociations;
              console.log('✅ District associations added:', districtAssociations.length, 'associations');
            } else {
              console.log('❌ Failed to fetch district associations:', districtError);
            }
          }

          // If user has a school_id, fetch school info
          if (basicProfile.school_id) {
            console.log('🏫 Fetching school info for school_id:', basicProfile.school_id);
            const { data: schoolData, error: schoolError } = await supabase
              .from('schools')
              .select('*')
              .eq('id', basicProfile.school_id)
              .single();

            console.log('🏫 School query result:', schoolData, 'Error:', schoolError);

            if (!schoolError && schoolData) {
              extendedProfile.school = schoolData;
              console.log('✅ School data added:', schoolData.name);
            } else {
              console.log('❌ Failed to fetch school data:', schoolError);
            }
          }

          console.log('🎯 Final extended profile:', extendedProfile);

          setState(prev => ({
            ...prev,
            profile: extendedProfile,
            debugInfo: {
              extendedProfile,
              userId: user.id,
              step: 'profile_loaded_successfully',
              role: extendedProfile.role,
              hasDistrictAssociations: extendedProfile.district_associations?.length > 0,
              hasSchool: !!extendedProfile.school
            },
            isLoading: false
          }));

        } catch (error) {
          console.error('💥 Profile fetch error:', error);
          setState(prev => ({
            ...prev,
            profile: null,
            debugInfo: {
              profileError: error,
              userId: user.id,
              step: 'profile_fetch_error'
            },
            isLoading: false
          }));
        }
      } else {
        console.log('❌ No user found');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('💥 Top-level error:', error);
      setState(prev => ({
        ...prev,
        authError: true,
        debugInfo: {
          topLevelError: error,
          step: 'top_level_error'
        },
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    ...state,
    refetchProfile: () => fetchUserData(false)
  };
};
