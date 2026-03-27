import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getXPReward, calculateLevelFromXP } from '../_shared/levelSystem.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error('Missing env vars:', { hasUrl: !!supabaseUrl, hasKey: !!serviceRoleKey, hasAnon: !!anonKey });
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const supabase = createClient(supabaseUrl, anonKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (!user || authError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { xp_amount, source, metadata = {} } = await req.json();
    const finalXP = getXPReward(source, metadata);

    console.log(`Awarding ${finalXP} XP to user ${user.id} from source: ${source}`);

    // Get or create user progression
    let { data: progression, error: progError } = await supabaseAdmin
      .from('user_progression')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progError || !progression) {
      const { data: newProg, error: createError } = await supabaseAdmin
        .from('user_progression')
        .insert({ user_id: user.id, total_xp: 0, current_level: 1 })
        .select()
        .single();

      if (createError) throw createError;
      progression = newProg;
    }

    const oldXP = progression.total_xp || 0;
    const oldLevel = progression.current_level || 1;
    const newXP = oldXP + finalXP;
    const newLevel = calculateLevelFromXP(newXP);
    const leveledUp = newLevel > oldLevel;

    // Only update columns that exist on user_progression
    const updates: Record<string, any> = {
      total_xp: newXP,
      current_level: newLevel,
      updated_at: new Date().toISOString(),
    };

    if (source === 'lesson') {
      updates.lessons_completed = (progression.lessons_completed || 0) + 1;
    } else if (source === 'certification') {
      updates.certifications_completed = (progression.certifications_completed || 0) + 1;
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_progression')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        xp_awarded: finalXP,
        new_total_xp: newXP,
        old_level: oldLevel,
        new_level: newLevel,
        leveled_up: leveledUp,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in award-xp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
