import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify user and check usage limits
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if user can start premium voice session
    const { data: canStart, error: checkError } = await supabase.rpc(
      'can_start_premium_voice_session',
      { target_student_id: user.id }
    );

    if (checkError || !canStart?.allowed) {
      return new Response(
        JSON.stringify({ error: 'Monthly limit reached', details: canStart }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Get ephemeral token for Gemini Realtime
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            responseModalities: "audio",
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Puck"
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: "You are an encouraging English language tutor. Your PRIMARY GOAL is to maintain conversation in English as much as possible.\n\nCORE PRINCIPLES:\n- Always speak in English by default\n- Keep conversations flowing naturally in English\n- Use simple English explanations when students struggle\n- Ask engaging questions to encourage English practice\n\nWHEN TO USE NATIVE LANGUAGE (RARE):\nOnly use the student's native language when:\n1. The student explicitly asks for translation/clarification and seems genuinely confused\n2. A critical grammar concept needs explanation and English explanations haven't worked\n3. Safety or urgent clarification is needed\n\nIMPORTANT: After any native language clarification:\n- Keep it brief (1-2 sentences max)\n- Immediately redirect back to English\n- Say something like 'Now let's continue in English...'\n- Resume the English conversation naturally\n\nYour job is to maximize English practice time while being supportive when genuine confusion arises."
            }]
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini error:", error);
      throw new Error(`Failed to create Gemini session: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Gemini session created for user:", user.id);

    // Generate session ID for tracking
    const sessionId = crypto.randomUUID();
    const sessionStart = Date.now();

    // Return session data to client
    return new Response(JSON.stringify({
      ...data,
      user_id: user.id,
      session_id: sessionId,
      session_start: sessionStart,
      provider: 'gemini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
