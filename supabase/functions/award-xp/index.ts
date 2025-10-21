import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const { xp_amount, source, metadata = {} }: AwardXPRequest = await req.json();

    console.log(`Awarding ${xp_amount} XP to user ${user.id} from source: ${source}`);

    // Get or create user progression
    let { data: progression, error: progError } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progError || !progression) {
      console.log('Creating new progression record for user');
      const { data: newProg, error: createError } = await supabase
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
    const newXP = oldXP + xp_amount;

    // Calculate new level (Formula: 100 * level^1.5)
    let newLevel = 1;
    while (Math.floor(100 * Math.pow(newLevel + 1, 1.5)) <= newXP) {
      newLevel++;
    }

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
    } else if (source === 'voice') {
      updates.voice_sessions_completed = progression.voice_sessions_completed + 1;
    }

    const { error: updateError } = await supabase
      .from('user_progression')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Check for achievement unlocks
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: unlockedAchievements } = await supabase
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
        const { error: achError } = await supabase
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
        xp_awarded: xp_amount,
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
