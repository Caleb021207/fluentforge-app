import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting get-leaderboard-data function');
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized',
        message: 'No authorization header'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted, length:', token.length);

    // Create admin client for auth verification and database queries
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the JWT token by passing it directly
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (!user || authError) {
      console.error('❌ Auth failed:', authError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized',
        message: 'Authentication failed'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const requestBody = await req.json();
    const type = requestBody.type || 'xp'; // xp, streak, lessons
    const scope = requestBody.scope || 'global'; // global, school, class
    const limit = parseInt(requestBody.limit || '50');

    console.log(`Fetching leaderboard: type=${type}, scope=${scope}, limit=${limit}, userId=${user.id}`);

    // Get user's profile for school/class info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single();

    console.log('User profile:', { profile, profileError });

    // Get the user IDs to include in leaderboard
    let userIds: string[] = [];

    // Apply scope filtering
    if (scope === 'school' && profile?.school_id) {
      // Filter by school - need to join through profiles
      const { data: schoolProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', profile.school_id);

      userIds = schoolProfiles?.map(p => p.id) || [];
      console.log('School scope - found user IDs:', userIds);
    } else if (scope === 'class') {
      // Get classes where user is the teacher
      const { data: teacherClasses } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id);

      console.log('Teacher classes:', teacherClasses);

      // Get classes where user is a student
      const { data: studentEnrollments } = await supabase
        .from('student_enrollments')
        .select('class_id')
        .eq('student_id', user.id);

      console.log('Student enrollments:', studentEnrollments);

      // Combine all class IDs
      const allClassIds = [
        ...(teacherClasses?.map(c => c.id) || []),
        ...(studentEnrollments?.map(e => e.class_id) || [])
      ];

      console.log('All class IDs:', allClassIds);

      if (allClassIds.length > 0) {
        // Get all students enrolled in these classes
        const { data: classEnrollments } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .in('class_id', allClassIds);

        userIds = classEnrollments?.map(e => e.student_id) || [];
        
        // Always include the current user
        if (!userIds.includes(user.id)) {
          userIds.push(user.id);
        }

        console.log('Class scope - found user IDs:', userIds);
      } else {
        // If no classes found, just return current user
        userIds = [user.id];
        console.log('No classes found, showing only current user');
      }
    }

    // Build query
    let query = supabase
      .from('user_progression')
      .select('*');

    // Apply user filtering if we have specific users
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    // Sort by requested type
    if (type === 'xp') {
      query = query.order('total_xp', { ascending: false });
    } else if (type === 'streak') {
      query = query.order('current_streak_days', { ascending: false });
    } else if (type === 'lessons') {
      query = query.order('lessons_completed', { ascending: false });
    }

    query = query.limit(limit);

    const { data: progressionData, error } = await query;

    if (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }

    console.log(`📊 Found ${progressionData?.length || 0} progression entries`);

    // Get profiles separately
    const userIdsInProgression = progressionData?.map(p => p.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIdsInProgression);

    // Create a map of profiles
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Format response with rank
    const leaderboard = progressionData?.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      display_name: profileMap.get(entry.user_id)?.display_name || 'Anonymous',
      avatar_url: profileMap.get(entry.user_id)?.avatar_url,
      total_xp: entry.total_xp,
      current_level: entry.current_level,
      current_streak_days: entry.current_streak_days,
      lessons_completed: entry.lessons_completed,
      is_current_user: entry.user_id === user.id,
    })) || [];

    const userRankIndex = leaderboard.findIndex(e => e.is_current_user);
    const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

    console.log(`✅ Returning ${leaderboard.length} entries, user rank: ${userRank}`);

    return new Response(
      JSON.stringify({
        success: true,
        leaderboard,
        user_rank: userRank,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in get-leaderboard-data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        message: 'Failed to fetch leaderboard data'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
