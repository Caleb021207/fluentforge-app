
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map OpenAI voice names to Azure neural voices
const openAIToAzureVoiceMap: Record<string, string> = {
  'alloy': 'en-US-AriaNeural',
  'echo': 'en-US-GuyNeural',
  'fable': 'en-GB-SoniaNeural',
  'onyx': 'en-US-DavisNeural',
  'nova': 'en-US-JennyNeural',
  'shimmer': 'en-US-SaraNeural',
};

// Map language names to Azure voices (for language-based requests)
const languageToAzureVoiceMap: Record<string, string> = {
  'spanish': 'es-ES-ElviraNeural',
  'english': 'en-US-AriaNeural',
  'portuguese': 'pt-BR-FranciscaNeural',
  'french': 'fr-FR-DeniseNeural',
  'german': 'de-DE-KatjaNeural',
  'italian': 'it-IT-ElsaNeural',
  'japanese': 'ja-JP-NanamiNeural',
  'korean': 'ko-KR-SunHiNeural',
  'mandarin': 'zh-CN-XiaoxiaoNeural',
  'chinese': 'zh-CN-XiaoxiaoNeural',
  'russian': 'ru-RU-SvetlanaNeural',
  'arabic': 'ar-SA-ZariyahNeural',
  'hindi': 'hi-IN-SwaraNeural',
  'urdu': 'ur-PK-UzmaNeural',
  'bengali': 'bn-IN-TanishaaNeural',
  'gujarati': 'gu-IN-DhwaniNeural',
  'punjabi': 'pa-IN-GurpreetNeural',
  'nepali': 'ne-NP-HemkalaNeural',
  'thai': 'th-TH-PremwadeeNeural',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy', language, speechRate = 1.0, userId } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    // Check TTS token usage limits if userId is provided
    if (userId) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: limits, error: limitsError } = await supabaseClient
        .from('student_usage_limits')
        .select('tts_tokens_used_current_month, tts_tokens_monthly_limit')
        .eq('student_id', userId)
        .single();

      if (limits && limits.tts_tokens_used_current_month >= limits.tts_tokens_monthly_limit) {
        console.log(`TTS token limit reached for user ${userId}: ${limits.tts_tokens_used_current_month}/${limits.tts_tokens_monthly_limit}`);
        return new Response(
          JSON.stringify({ 
            useFallback: true,
            reason: 'TTS monthly token limit reached',
            tokensUsed: limits.tts_tokens_used_current_month,
            tokensLimit: limits.tts_tokens_monthly_limit
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const azureSpeechKey = Deno.env.get('AZURE_SPEECH_KEY');
    const azureRegion = Deno.env.get('AZURE_REGION') || 'eastus';
    
    if (!azureSpeechKey) {
      throw new Error('Azure Speech key not configured');
    }

    console.log(`TTS request - text length: ${text.length}, voice: ${voice}, language: ${language}, rate: ${speechRate}`);

    // Determine which Azure voice to use
    let azureVoice: string;
    let locale: string;
    
    if (language) {
      // Language-based voice selection
      azureVoice = languageToAzureVoiceMap[language.toLowerCase()] || 'en-US-AriaNeural';
      locale = azureVoice.split('-').slice(0, 2).join('-'); // Extract locale from voice name
    } else {
      // Voice name-based selection (OpenAI compatibility)
      azureVoice = openAIToAzureVoiceMap[voice] || 'en-US-AriaNeural';
      locale = 'en-US';
    }

    console.log(`Using Azure voice: ${azureVoice} (locale: ${locale})`);

    // Convert speechRate to Azure prosody rate format
    // Azure accepts values like "x-slow", "slow", "medium", "fast", "x-fast" or percentage like "120%"
    const getRateString = (rate: number): string => {
      if (rate <= 0.75) return 'x-slow';
      if (rate <= 0.9) return 'slow';
      if (rate <= 1.1) return 'medium';
      if (rate <= 1.25) return 'fast';
      if (rate > 1.25) return 'x-fast';
      return 'medium';
    };

    const rateString = speechRate !== 1.0 ? getRateString(speechRate) : 'medium';

    // Build SSML with prosody for rate control
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${locale}'>
      <voice name='${azureVoice}'>
        <prosody rate='${rateString}'>${text}</prosody>
      </voice>
    </speak>`;

    // Generate speech using Azure TTS
    const response = await fetch(
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureSpeechKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure TTS error:', errorText);
      throw new Error(`Azure TTS failed: ${errorText}`);
    }

    // Convert audio to base64 (process in chunks to avoid call stack overflow)
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000; // 32KB chunks
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binary);

    console.log("Successfully generated speech with Azure TTS");

    // Track TTS token usage if userId is provided
    if (userId) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Estimate tokens: approximately 4 characters = 1 token
      const estimatedTokens = Math.ceil(text.length / 4);
      
      try {
        // Track to api_calls_tracking for logging
        await supabaseClient
          .from('api_calls_tracking')
          .insert({
            service: 'azure_tts',
            endpoint: 'text-to-speech',
            user_id: userId
          });

        // Update TTS token usage
        await supabaseClient.rpc('increment_tts_token_usage', {
          p_user_id: userId,
          p_tokens: estimatedTokens
        });
        console.log(`✅ Tracked ${estimatedTokens} token(s) of TTS usage for user ${userId}`);
      } catch (trackError) {
        console.error('Error tracking TTS usage:', trackError);
        // Don't fail the request if tracking fails
      }
    }

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate speech. Please try again.',
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
