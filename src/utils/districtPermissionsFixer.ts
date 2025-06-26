
import { supabase } from "@/integrations/supabase/client";

export const checkAndFixDistrictPermissions = async (userId: string) => {
  try {
    console.log('Checking district permissions for user:', userId);

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return { success: false, error: 'Profile not found', details: profileError };
    }

    console.log('Current profile:', profile);

    // Check district_users table
    const { data: districtUsers, error: districtError } = await supabase
      .from('district_users')
      .select('*, school_districts(*)')
      .eq('user_id', userId);

    if (districtError) {
      console.error('District users error:', districtError);
      return { success: false, error: 'District users query failed', details: districtError };
    }

    console.log('District associations:', districtUsers);

    // If user has district role but no district associations, this is a problem
    if (profile.role === 'district' && (!districtUsers || districtUsers.length === 0)) {
      console.warn('User has district role but no district associations');
      
      // Try to find a district to associate with
      const { data: districts, error: districtsError } = await supabase
        .from('school_districts')
        .select('*')
        .limit(1);

      if (!districtsError && districts && districts.length > 0) {
        console.log('Attempting to associate user with district:', districts[0]);
        
        const { error: insertError } = await supabase
          .from('district_users')
          .insert({
            user_id: userId,
            district_id: districts[0].id,
            role: 'admin'
          });

        if (insertError) {
          console.error('Failed to create district association:', insertError);
          return { success: false, error: 'Failed to create district association', details: insertError };
        }

        // Update schools to be linked to this district if they aren't already
        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({ district_id: districts[0].id })
          .is('district_id', null);

        if (schoolUpdateError) {
          console.warn('Failed to link schools to district:', schoolUpdateError);
        }

        return { success: true, message: 'District association created and schools linked', district: districts[0] };
      }
    }

    // Check if schools in the district are properly linked
    if (districtUsers && districtUsers.length > 0) {
      const districtId = districtUsers[0].district_id;
      
      // Update any schools without district_id to be linked to this district
      const { error: schoolUpdateError } = await supabase
        .from('schools')
        .update({ district_id: districtId })
        .is('district_id', null);

      if (schoolUpdateError) {
        console.warn('Failed to link schools to district:', schoolUpdateError);
      }
    }

    // Test data visibility
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*');

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('student_enrollments')
      .select('*');

    return {
      success: true,
      profile,
      districtUsers,
      dataAccess: {
        schools: schools?.length || 0,
        schoolsError,
        classes: classes?.length || 0,
        classesError,
        enrollments: enrollments?.length || 0,
        enrollmentsError
      }
    };

  } catch (error) {
    console.error('Permission check failed:', error);
    return { success: false, error: 'Permission check failed', details: error };
  }
};

export const forceRefreshAuth = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh failed:', error);
      return { success: false, error };
    }
    console.log('Session refreshed successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Force refresh failed:', error);
    return { success: false, error };
  }
};
