import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getXPReward, calculateLevelFromXP, getXPForLevel } from '../_shared/levelSystem.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AwardXPRequest {
  xp_amount: number;
  source: string;
  metadata?: Record<string, any>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

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

    // Extract the JWT token from the Bearer token
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create client for auth verification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (!user || authError) {
      console.error('User authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated user: ${user.id}`);

    const { xp_amount, source, metadata = {} }: AwardXPRequest = await req.json();

    // Recalculate XP using the comprehensive level system
    const recalculatedXP = getXPReward(source, metadata);
    const finalXP = recalculatedXP; // Use the recalculated XP

    console.log(`Awarding ${finalXP} XP (original: ${xp_amount}, recalculated: ${recalculatedXP}) to user ${user.id} from source: ${source}`, metadata);

    // Get or create user progression - use admin client to bypass RLS
    let { data: progression, error: progError } = await supabaseAdmin
      .from('user_progression')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progError || !progression) {
      console.log('Creating new progression record for user');
      const { data: newProg, error: createError } = await supabaseAdmin
        .from('user_progression')
        .insert({
          user_id: user.id,
          total_xp: 0,
          current_level: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      progression = newProg;
    }

    const oldXP = progression.total_xp;
    const oldLevel = progression.current_level;
    const newXP = oldXP + finalXP;

    // Calculate new level using the shared level system
    const newLevel = calculateLevelFromXP(newXP);

    const leveledUp = newLevel > oldLevel;

    // Update progression based on source
    const updates: any = {
      total_xp: newXP,
      current_level: newLevel,
      updated_at: new Date().toISOString(),
    };

    if (source === 'lesson') {
      updates.lessons_completed = progression.lessons_completed + 1;
    } else if (source === 'certification') {
      updates.certifications_completed = progression.certifications_completed + 1;
    } else if (source === 'voice' || source === 'voice_message') {
      updates.voice_sessions_completed = progression.voice_sessions_completed + 1;
      if (source === 'voice_message') {
        updates.voice_messages_sent = (progression.voice_messages_sent || 0) + 1;
      }
    } else if (source === 'text_message') {
      updates.text_messages_sent = (progression.text_messages_sent || 0) + 1;
    } else if (source === 'pronunciation') {
      updates.pronunciation_exercises = (progression.pronunciation_exercises || 0) + 1;
    } else if (source === 'conversation_analysis') {
      updates.conversations_analyzed = (progression.conversations_analyzed || 0) + 1;
    } else if (source === 'exam_analysis') {
      updates.exams_completed = (progression.exams_completed || 0) + 1;
    } else if (source === 'premium_voice') {
      updates.premium_voice_messages = (progression.premium_voice_messages || 0) + 1;
    } else if (source === 'realtime_ai') {
      updates.realtime_ai_messages = (progression.realtime_ai_messages || 0) + 1;
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_progression')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Check for achievement unlocks
    const { data: allAchievements } = await supabaseAdmin
      .from('achievements')
      .select('*');

    const { data: unlockedAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);
    const newAchievements: Achievement[] = [];

    const progressionAfterUpdate = {
      ...progression,
      ...updates,
    };

    for (const achievement of allAchievements || []) {
      if (unlockedIds.has(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.requirement_type) {
        case 'lessons_completed':
          unlocked = progressionAfterUpdate.lessons_completed >= achievement.requirement_value;
          break;
        case 'certifications_completed':
          unlocked = progressionAfterUpdate.certifications_completed >= achievement.requirement_value;
          break;
        case 'voice_sessions':
          unlocked = progressionAfterUpdate.voice_sessions_completed >= achievement.requirement_value;
          break;
        case 'certification_score':
          unlocked = metadata.score >= achievement.requirement_value;
          break;
        case 'streak_days':
          unlocked = progressionAfterUpdate.current_streak_days >= achievement.requirement_value;
          break;
        case 'special':
          // Handle special achievements based on metadata
          if (achievement.name === 'Welcome') unlocked = true;
          break;
      }

      if (unlocked) {
        const { error: achError } = await supabaseAdmin
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        if (!achError) {
          newAchievements.push(achievement);
          console.log(`Achievement unlocked: ${achievement.name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        xp_awarded: finalXP,
        new_total_xp: newXP,
        old_level: oldLevel,
        new_level: newLevel,
        leveled_up: leveledUp,
        new_achievements: newAchievements,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in award-xp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
