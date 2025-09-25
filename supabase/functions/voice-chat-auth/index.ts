
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
    const { language } = await req.json();
    
    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');
    
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Get auth token from request
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('No authorization header provided');
    }

    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false }
      }
    );

    // Get user from auth token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Log API access for monitoring
    await supabaseClient
      .from('api_calls_tracking')
      .insert({
        user_id: user.id,
        call_type: 'voice_chat_auth'
      });

    // Return the API key
    return new Response(
      JSON.stringify({
        apiKey: ELEVEN_LABS_API_KEY,
        language: language || 'english'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in voice-chat-auth function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
