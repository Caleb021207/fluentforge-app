
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The fixed API key
const ELEVEN_LABS_API_KEY = "sk-proj-uj4EFHw3w7FWowdZ2QpdРDЗBilH-QQemPNvvcjOI9SEGGQA1cgFVhhbj4HeuLy2lvRanGIVbEMT3BIbkFJnOL5Q8ffbuV95RslwnKYTfDQkg70HUgVhiDgVI2QHIG3laJqkR407rytHJUyQoHvwMvZfZav4A";

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
