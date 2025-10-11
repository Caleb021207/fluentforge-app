import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check usage limits
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

    const { nativeLanguage = 'english', targetLanguage = 'english' } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const systemPrompt = `You are a helpful language tutor helping a ${nativeLanguage} speaker practice ${targetLanguage}. As soon as you connect, greet the student warmly in ${targetLanguage} and ask them an engaging question to start the conversation. Speak clearly at a moderate pace. Provide gentle corrections when needed, and you may occasionally explain errors briefly in ${nativeLanguage} if the error is significant. Always be supportive, encouraging, and patient. Keep the conversation flowing naturally.`;

    // Request ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "sage",
        instructions: systemPrompt,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        }
      }),
    });

    const data = await response.json();
    console.log("Session created for user:", user.id);

    // Track session start
    await supabase.from('usage_tracking').insert({
      student_id: user.id,
      session_id: crypto.randomUUID(),
      session_type: 'premium_voice_practice',
      minutes_used: 0
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
