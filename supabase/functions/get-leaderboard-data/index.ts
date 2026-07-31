import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { buildCorsHeaders } from "../_shared/cors.ts";
import {
  mergeLeaderboardRows,
  rankLeaderboard,
  type CanonicalStreakRow,
  type LeaderboardSortType,
  type ProgressionRow,
} from "../_shared/streakLeaderboard.ts";


serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

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

    // Create admin client ONLY for auth verification
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the JWT token by passing it directly
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    
    if (authError || !user) {
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

    // Create user client with JWT to respect RLS and prevent PII exposure
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const requestBody = await req.json();
    const type = requestBody.type || 'xp'; // xp, streak, lessons
    const scope = requestBody.scope || 'global'; // global, school, class
    const parsedLimit = parseInt(requestBody.limit || '50');
    // Guard: a NaN/negative limit would make .limit() throw downstream.
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 200)
      : 50;

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
      // Filter by school - use public data to avoid PII exposure
      const { data: schoolProfiles } = await supabase
        .from('profile_public_data')
        .select('user_id')
        .eq('school_id', profile.school_id);

      // De-duplicate: a learner must appear on the board exactly once.
      userIds = [...new Set(schoolProfiles?.map(p => p.user_id) || [])];
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
        const { data: classEnrollments, error: enrollError } = await supabase
          .from('student_enrollments')
          .select('student_id')
          .in('class_id', allClassIds);

        console.log('Class enrollments query result:', { data: classEnrollments, error: enrollError });

        // De-duplicate: a student enrolled in more than one of the teacher's
        // classes would otherwise be returned once per enrollment, producing
        // duplicate leaderboard rows (and duplicate React keys).
        userIds = [...new Set(classEnrollments?.map(e => e.student_id) || [])];

        // Always include the current user
        if (!userIds.includes(user.id)) {
          userIds.push(user.id);
        }

        console.log('Class scope - found user IDs:', userIds.length, 'users:', userIds);
      } else {
        // If no classes found, just return current user
        userIds = [user.id];
        console.log('No classes found, showing only current user');
      }
    }

    // ------------------------------------------------------------------
    // Streak coherence (wip-01a F6.3; plan 05 §7): learner_streaks is the
    // CANONICAL streak source. user_progression.current_streak_days is a
    // frozen legacy column (only the broken check-streak ever advanced it)
    // and is used strictly as a fallback for users the canonical table has
    // never seen. The old code both SORTED and DISPLAYED the dead column,
    // so the board ranked by a number almost nothing writes.
    // ------------------------------------------------------------------
    const sortType: LeaderboardSortType =
      type === 'streak' ? 'streak' : type === 'lessons' ? 'lessons' : 'xp';
    const scoped = userIds.length > 0;

    // 1. Progression rows (display fields + legacy streak fallback).
    //    For xp/lessons the DB pre-sorts and pre-limits by the real key;
    //    for streak the DB order is only a fallback-candidate heuristic
    //    (the dead column), so overfetch and let the merged sort decide.
    let progressionQuery = supabase.from('user_progression').select('*');
    if (scoped) {
      progressionQuery = progressionQuery.in('user_id', userIds);
    }
    if (sortType === 'xp') {
      progressionQuery = progressionQuery.order('total_xp', { ascending: false }).limit(limit);
    } else if (sortType === 'lessons') {
      progressionQuery = progressionQuery.order('lessons_completed', { ascending: false }).limit(limit);
    } else {
      progressionQuery = progressionQuery
        .order('current_streak_days', { ascending: false })
        .limit(limit * 2);
    }

    const { data: progressionData, error } = await progressionQuery;

    if (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }

    console.log(`📊 Found ${progressionData?.length || 0} progression entries`);

    const progressionRows: ProgressionRow[] = progressionData ?? [];
    const progressionIds = new Set(progressionRows.map((p) => p.user_id));

    // 2. Canonical streak rows.
    //    - streak board: canonical rows ARE the ranking source — top-N by
    //      current_streak (scoped to userIds when a scope applies).
    //    - xp/lessons boards: fetch canonical rows for the displayed users
    //      so the streak column shows the same number as every other
    //      surface (no three-numbers-disagree screens).
    //    MUST use the service-role client: learner_streaks RLS is
    //    own/teacher/admin-only, so the user client would return only the
    //    caller's row and rank everyone ELSE by the dead legacy column —
    //    per-viewer incoherence. Only user_id + current_streak cross this
    //    boundary (numbers already surfaced by the leaderboard itself; no
    //    PII — names still come from profile_public_data under user RLS).
    let streakQuery = adminClient
      .from('learner_streaks')
      .select('user_id, current_streak');
    if (sortType === 'streak') {
      if (scoped) {
        streakQuery = streakQuery.in('user_id', userIds);
      }
      // Bounded even when scoped: a large school roster must not produce
      // an unbounded fetch. Overfetch 2x so post-merge teacher filtering
      // still leaves a full board.
      streakQuery = streakQuery
        .order('current_streak', { ascending: false })
        .limit(limit * 2);
    } else {
      streakQuery = streakQuery.in('user_id', [...progressionIds]);
    }

    const { data: streakData, error: streakError } = await streakQuery;
    if (streakError) {
      // Canonical table unreadable: degrade to legacy numbers rather than 500.
      console.error('⚠️ learner_streaks query failed, falling back to legacy column:', streakError);
    }
    const canonicalRows: CanonicalStreakRow[] = streakData ?? [];

    // 3. For the streak board, canonical users may lack a progression row
    //    (e.g. streak earned before user_progression backfill). Fetch their
    //    display fields so they do not show as 0-XP ghosts.
    if (sortType === 'streak') {
      const missingIds = canonicalRows
        .map((s) => s.user_id)
        .filter((id) => !progressionIds.has(id));
      if (missingIds.length > 0) {
        const { data: extraProgression } = await supabase
          .from('user_progression')
          .select('*')
          .in('user_id', missingIds);
        for (const row of extraProgression ?? []) {
          progressionRows.push(row);
        }
      }
    }

    // 4. Merge (canonical-wins) and rank by the coherent value.
    const ranked = rankLeaderboard(
      mergeLeaderboardRows(progressionRows, canonicalRows),
      sortType,
      limit,
    );

    console.log(`📊 Ranked ${ranked.length} entries by ${sortType} (canonical streak source)`);

    // Get public profile data (no PII exposure)
    const rankedIds = ranked.map((p) => p.user_id);
    console.log('Fetching profile_public_data for:', rankedIds.length, 'users');

    const { data: profiles, error: profilesError } = await supabase
      .from('profile_public_data')
      .select('user_id, display_name, avatar_url, role')
      .in('user_id', rankedIds);

    console.log('Profile data fetched:', profiles?.length || 0, 'profiles, error:', profilesError);

    // Create a map of profiles
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Format response with rank, excluding teachers.
    // NOTE: current_streak_days keeps its name for client compatibility
    // (LeaderboardSection.tsx reads it) but now carries the COHERENT value.
    const leaderboard = ranked.map((entry, index) => {
      const userProfile = profileMap.get(entry.user_id);
      return {
        rank: index + 1,
        user_id: entry.user_id,
        display_name: userProfile?.display_name || 'Anonymous',
        avatar_url: userProfile?.avatar_url,
        total_xp: entry.total_xp,
        current_level: entry.current_level,
        current_streak_days: entry.current_streak_days,
        lessons_completed: entry.lessons_completed,
        is_current_user: entry.user_id === user.id,
        role: userProfile?.role,
      };
    }).filter(entry => entry.role !== 'teacher');
    
    // Recalculate ranks after filtering
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

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
    // Narrow the untyped catch value (deno check runs strict: TS18046).
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Error in get-leaderboard-data:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'An unexpected error occurred',
        message: 'Failed to fetch leaderboard data'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
