
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find abandoned sessions (more than 15 minutes old with no end time)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: abandonedSessions, error: queryError } = await supabaseClient
      .from('premium_voice_chat_sessions')
      .select('id, user_id, session_start')
      .filter('session_end', 'is', null)
      .lt('session_start', fifteenMinutesAgo);

    if (queryError) {
      console.error('Error finding abandoned sessions:', queryError);
      throw queryError;
    }

    console.log(`Found ${abandonedSessions?.length || 0} abandoned voice sessions`);

    if (!abandonedSessions || abandonedSessions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No abandoned sessions found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Close each abandoned session with a maximum 10-minute duration
    const updateResults = [];
    const now = new Date();
    
    for (const session of abandonedSessions) {
      const sessionStart = new Date(session.session_start);
      // Cap session at 10 minutes max
      const maxEnd = new Date(sessionStart.getTime() + 10 * 60 * 1000);
      const sessionEnd = maxEnd < now ? maxEnd : now;
      
      const { data, error } = await supabaseClient
        .from('premium_voice_chat_sessions')
        .update({ session_end: sessionEnd.toISOString() })
        .eq('id', session.id);
      
      updateResults.push({
        sessionId: session.id,
        userId: session.user_id,
        success: !error,
        error: error ? (error as any)?.message || String(error) : null
      });
      
      if (error) {
        console.error(`Error closing session ${session.id}:`, error);
      } else {
        console.log(`Closed abandoned session ${session.id} for user ${session.user_id}`);
        
        // Trigger metrics recalculation for this user
        try {
          await supabaseClient.rpc('recalculate_student_metrics', { 
            target_student_id: session.user_id 
          });
        } catch (recalcError) {
          console.error(`Error recalculating metrics for user ${session.user_id}:`, recalcError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${abandonedSessions.length} abandoned sessions`,
        results: updateResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-voice-sessions function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
