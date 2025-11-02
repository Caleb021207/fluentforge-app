
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { audio, language, userId, durationSeconds } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    // Check STT usage limits if userId is provided
    if (userId) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: limits, error: limitsError } = await supabaseClient
        .from('student_usage_limits')
        .select('stt_minutes_used_current_month, stt_minutes_monthly_limit')
        .eq('student_id', userId)
        .single();

      if (limits && limits.stt_minutes_used_current_month >= limits.stt_minutes_monthly_limit) {
        console.log(`STT limit reached for user ${userId}: ${limits.stt_minutes_used_current_month}/${limits.stt_minutes_monthly_limit}`);
        return new Response(
          JSON.stringify({ 
            useFallback: true,
            reason: 'STT monthly limit reached',
            minutesUsed: limits.stt_minutes_used_current_month,
            minutesLimit: limits.stt_minutes_monthly_limit
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log("Received audio data, processing...");
    console.log(`Language specified: ${language || 'none, will use default'}`);
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // Support multilingual transcription by not specifying language (auto-detect)
    // or use specific language when provided
    if (language && language !== 'auto') {
      formData.append('language', language);
      console.log(`Sending to OpenAI Whisper API with language: ${language}...`);
    } else {
      console.log('Sending to OpenAI Whisper API with auto language detection (multilingual support)...');
    }

    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription successful:", result.text);

    // Track STT usage if userId is provided
    if (userId && durationSeconds) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
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
      JSON.stringify({ text: result.text }),
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
