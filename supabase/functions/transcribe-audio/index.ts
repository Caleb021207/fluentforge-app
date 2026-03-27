import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { audio, language, userId, durationSeconds } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    // Check STT usage limits if userId is provided
    if (userId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: limits } = await supabaseClient
        .from('student_usage_limits')
        .select('whisper_stt_minutes_used_current_month, whisper_stt_minutes_monthly_limit')
        .eq('student_id', userId)
        .single();

      if (limits && limits.whisper_stt_minutes_used_current_month >= limits.whisper_stt_minutes_monthly_limit) {
        console.log(`STT limit reached for user ${userId}`);
        return new Response(
          JSON.stringify({ 
            useFallback: true,
            reason: 'STT monthly limit reached',
            minutesUsed: limits.whisper_stt_minutes_used_current_month,
            minutesLimit: limits.whisper_stt_minutes_monthly_limit
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log("Received audio data, processing with Lovable AI...");
    console.log(`Language specified: ${language || 'auto-detect'}`);

    const languageHint = language && language !== 'auto' 
      ? `The audio is in ${language}. ` 
      : '';

    // Use Gemini's multimodal capability to transcribe audio
    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a speech-to-text transcription system. ${languageHint}Transcribe the audio exactly as spoken. Output ONLY the transcribed text with no extra commentary, labels, or formatting. If the audio is silent or unintelligible, output an empty string.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
                input_audio: {
                  data: audio,
                  format: 'wav'
                }
              },
              {
                type: 'text',
                text: 'Transcribe this audio exactly as spoken.'
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const result = await response.json();
    const transcribedText = result.choices?.[0]?.message?.content?.trim() || '';
    console.log("Transcription successful:", transcribedText);

    // Track STT usage if userId is provided
    if (userId && durationSeconds) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const estimatedMinutes = Math.ceil(durationSeconds / 60);
      
      await supabaseClient.rpc('increment_stt_usage', {
        p_student_id: userId,
        p_minutes: estimatedMinutes
      }).then(({ error }) => {
        if (error) console.error('Failed to track STT usage:', error);
        else console.log(`Tracked ${estimatedMinutes} STT minutes for user ${userId}`);
      });
    }

    return new Response(
      JSON.stringify({ text: transcribedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in transcribe-audio function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
