import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const getUserIdFromAuthHeader = (authHeader: string) => {
  const jwt = authHeader.replace('Bearer ', '').trim();
  const parts = jwt.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = JSON.parse(atob(parts[1]));
  const userId = payload.sub;

  if (!userId) {
    throw new Error('No sub claim in JWT');
  }

  return userId as string;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = getUserIdFromAuthHeader(authHeader);
    const today = new Date().toISOString().split('T')[0];

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: progression, error: progressionError } = await supabase
      .from('user_progression')
      .select('user_id, total_xp, current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (progressionError) {
      throw progressionError;
    }

    if (!progression) {
      const { error: createError } = await supabase
        .from('user_progression')
        .insert({
          user_id: userId,
          last_activity_date: today,
          current_streak: 1,
          longest_streak: 1,
        });

      if (createError) {
        throw createError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          current_streak: 1,
          longest_streak: 1,
          streak_bonus_xp: 25,
          streak_continued: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (progression.last_activity_date === today) {
      return new Response(
        JSON.stringify({
          success: true,
          current_streak: progression.current_streak ?? 0,
          longest_streak: progression.longest_streak ?? 0,
          streak_bonus_xp: 0,
          streak_continued: false,
          already_active_today: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const currentStreak = progression.current_streak ?? 0;
    const savedLongestStreak = progression.longest_streak ?? 0;

    let newStreak = 1;
    let streakContinued = false;
    let streakBonusXP = 0;

    if (progression.last_activity_date === yesterdayStr) {
      newStreak = currentStreak + 1;
      streakContinued = true;
      streakBonusXP = Math.min(25 + Math.floor(newStreak / 7) * 10, 100);
    }

    const longestStreak = Math.max(newStreak, savedLongestStreak);

    const { error: updateError } = await supabase
      .from('user_progression')
      .update({
        last_activity_date: today,
        current_streak: newStreak,
        longest_streak: longestStreak,
        total_xp: (progression.total_xp ?? 0) + streakBonusXP,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        current_streak: newStreak,
        longest_streak: longestStreak,
        streak_continued: streakContinued,
        streak_bonus_xp: streakBonusXP,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in check-streak:', error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});