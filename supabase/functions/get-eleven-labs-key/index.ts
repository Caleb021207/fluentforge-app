
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The fixed API key - using a hardcoded key for immediate functionality
const ELEVEN_LABS_API_KEY = "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";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user authentication status from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    // Return the ElevenLabs API key
    // Using the hardcoded key for immediate functionality
    // but also checking the environment variable as fallback
    const apiKey = ELEVEN_LABS_API_KEY || Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    return new Response(
      JSON.stringify({ apiKey }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 401,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
