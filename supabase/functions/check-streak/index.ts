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
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client for database operations (uses user's JWT for RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Since verify_jwt=true, Supabase has already verified the JWT
    // Extract user ID from the verified JWT
    let userId: string;
    try {
      const jwt = authHeader.replace('Bearer ', '').trim();
      const parts = jwt.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No sub claim in JWT');
      }
      
      console.log('Processing streak check for user:', userId);
    } catch (jwtError) {
      console.error('JWT decode error:', jwtError);
      throw new Error(`Unable to extract user ID from JWT: ${jwtError.message}`);
    }

    // Get user progression
    const { data: progression, error: progError } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progError || !progression) {
      console.log('No progression found, creating new record');
      const { data: newProg, error: createError } = await supabase
        .from('user_progression')
        .insert({
          user_id: userId,
          last_activity_date: new Date().toISOString().split('T')[0],
          current_streak_days: 1,
          longest_streak_days: 1,
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({
          success: true,
          current_streak: 1,
          streak_bonus_xp: 25,
          streak_continued: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progression.last_activity_date;

    // If already active today, no streak update needed
    if (lastActivity === today) {
      return new Response(
        JSON.stringify({
          success: true,
          current_streak: progression.current_streak_days,
          streak_bonus_xp: 0,
          streak_continued: false,
          already_active_today: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak: number;
    let streakContinued = false;
    let streakBonusXP = 0;

    if (lastActivity === yesterdayStr) {
      // Streak continues!
      newStreak = progression.current_streak_days + 1;
      streakContinued = true;
      streakBonusXP = Math.min(25 + Math.floor(newStreak / 7) * 10, 100); // Max 100 XP
    } else {
      // Streak broken
      newStreak = 1;
      streakBonusXP = 0;
    }

    const longestStreak = Math.max(newStreak, progression.longest_streak_days);

    // Update progression
    const { error: updateError } = await supabase
      .from('user_progression')
      .update({
        last_activity_date: today,
        current_streak_days: newStreak,
        longest_streak_days: longestStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Award bonus XP if streak continued
    if (streakBonusXP > 0) {
      const { error: xpError } = await supabase
        .from('user_progression')
        .update({
          total_xp: progression.total_xp + streakBonusXP,
        })
        .eq('user_id', userId);

      if (xpError) console.error('Error awarding streak bonus XP:', xpError);
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
