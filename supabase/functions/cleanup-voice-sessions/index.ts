
// Edge function to clean up abandoned premium voice chat sessions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Initialize Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    console.log("Starting cleanup of abandoned voice sessions");
    
    // Get current time
    const now = new Date();
    
    // Find sessions without end time that started more than 10 minutes ago
    const { data: abandonedSessions, error: fetchError } = await supabaseClient
      .from('premium_voice_chat_sessions')
      .select('id, user_id, session_start')
      .is('session_end', null)
      .lt('session_start', new Date(now.getTime() - 15 * 60 * 1000).toISOString());  // 15 min threshold
      
    if (fetchError) {
      throw new Error(`Error fetching abandoned sessions: ${fetchError.message}`);
    }
    
    if (!abandonedSessions || abandonedSessions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No abandoned sessions found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${abandonedSessions.length} abandoned sessions`);
    
    // Update each abandoned session with a proper end time - max 10 minutes duration
    const updates = abandonedSessions.map(session => {
      const sessionStart = new Date(session.session_start);
      // Calculate session end as 10 minutes from start, or current time, whichever is earlier
      const maxEnd = new Date(sessionStart.getTime() + 10 * 60 * 1000);
      const sessionEnd = maxEnd < now ? maxEnd : now;
      
      return {
        id: session.id,
        session_end: sessionEnd.toISOString(),
      };
    });
    
    // Perform bulk update
    const { error: updateError } = await supabaseClient
      .from('premium_voice_chat_sessions')
      .upsert(updates);
      
    if (updateError) {
      throw new Error(`Error updating abandoned sessions: ${updateError.message}`);
    }
    
    // Recalculate student metrics for affected users after updating sessions
    const userIds = [...new Set(abandonedSessions.map(s => s.user_id))];
    
    for (const userId of userIds) {
      try {
        await supabaseClient.rpc('recalculate_student_metrics', { target_student_id: userId });
      } catch (error) {
        console.error(`Error recalculating metrics for user ${userId}: ${error}`);
        // Continue with other users even if one fails
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Successfully closed ${abandonedSessions.length} abandoned sessions`,
        updated_users: userIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error in cleanup-voice-sessions function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
