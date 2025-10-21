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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'xp'; // xp, streak, lessons
    const scope = url.searchParams.get('scope') || 'global'; // global, school, class
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log(`Fetching leaderboard: type=${type}, scope=${scope}, limit=${limit}`);

    // Get user's profile for school/class info
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('user_progression')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          avatar_url,
          school_id
        )
      `);

    // Apply scope filtering
    if (scope === 'school' && profile?.school_id) {
      // Filter by school - need to join through profiles
      const { data: schoolProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', profile.school_id);

      const userIds = schoolProfiles?.map(p => p.id) || [];
      query = query.in('user_id', userIds);
    } else if (scope === 'class') {
      // Get students in user's classes
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('student_id, class_id')
        .in('class_id', [
          ...(await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', user.id)
            .then(r => r.data?.map(c => c.id) || [])),
          ...(await supabase
            .from('student_enrollments')
            .select('class_id')
            .eq('student_id', user.id)
            .then(r => r.data?.map(e => e.class_id) || [])),
        ]);

      const userIds = enrollments?.map(e => e.student_id) || [user.id];
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

    const { data, error } = await query;

    if (error) throw error;

    // Format response with rank
    const leaderboard = data?.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      display_name: entry.profiles?.display_name || 'Anonymous',
      avatar_url: entry.profiles?.avatar_url,
      total_xp: entry.total_xp,
      current_level: entry.current_level,
      current_streak_days: entry.current_streak_days,
      lessons_completed: entry.lessons_completed,
      is_current_user: entry.user_id === user.id,
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        leaderboard,
        user_rank: leaderboard.findIndex(e => e.is_current_user) + 1 || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-leaderboard-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
