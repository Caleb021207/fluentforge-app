import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for different languages
const VOICE_MAP: Record<string, string> = {
  'spanish': 'Lucia',
  'english': 'Joanna',
  'portuguese': 'Camila',
  'german': 'Vicki',
  'french': 'Lea',
  'italian': 'Bianca',
  'japanese': 'Mizuki',
  'korean': 'Seoyeon',
  'mandarin': 'Zhiyu',
  'russian': 'Tatyana',
  'arabic': 'Zeina',
  'hindi': 'Aditi',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, conversationHistory, targetLanguage, userLanguage } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log(`Custom realtime request - Target: ${targetLanguage}, User: ${userLanguage}`);

    // Map language names to Whisper language codes
    const languageCodeMap: Record<string, string> = {
      'spanish': 'es',
      'english': 'en',
      'portuguese': 'pt',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'japanese': 'ja',
      'korean': 'ko',
      'mandarin': 'zh',
      'russian': 'ru',
      'arabic': 'ar',
      'hindi': 'hi',
    };

    const whisperLanguageCode = languageCodeMap[targetLanguage.toLowerCase()] || 'en';
    console.log(`Using Whisper language code: ${whisperLanguageCode} for ${targetLanguage}`);

    // Step 1: Transcribe audio using Whisper
    console.log('Step 1: Transcribing audio with Whisper...');
    const transcribeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/transcribe-audio`,
      {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          audio,
          language: whisperLanguageCode
        }),
      }
    );

    if (!transcribeResponse.ok) {
      const errorText = await transcribeResponse.text();
      console.error('Whisper transcription error:', errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const { text: userTranscript } = await transcribeResponse.json();
    console.log(`Transcribed: "${userTranscript}"`);

    // Step 2: Generate response with GPT-4o-mini
    console.log('Step 2: Generating response with GPT-4o-mini...');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a friendly language tutor helping a ${userLanguage} speaker practice ${targetLanguage}. 
Keep responses conversational, natural, and around 2-3 sentences. 
Speak in ${targetLanguage} unless the user needs help understanding, then provide brief translations in ${userLanguage}.
Encourage the learner and gently correct major mistakes.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: userTranscript }
    ];

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('GPT API error:', errorText);
      throw new Error(`GPT generation failed: ${errorText}`);
    }

    const gptData = await gptResponse.json();
    const aiResponse = gptData.choices[0].message.content;
    console.log(`AI Response: "${aiResponse}"`);

    // Step 3: Synthesize speech with OpenAI TTS
    console.log('Step 3: Synthesizing speech with OpenAI TTS...');
    
    // Use alloy voice for all languages (it's multilingual)
    const voice = 'alloy';
    console.log(`Using OpenAI TTS voice: ${voice}`);

    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: aiResponse,
        speed: 1.0,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('OpenAI TTS error:', errorText);
      throw new Error(`TTS generation failed: ${errorText}`);
    }

    // Convert audio to base64
    const audioArrayBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

    console.log('Successfully generated response with audio');

    return new Response(
      JSON.stringify({
        userTranscript,
        aiResponse,
        audioBase64,
        audioFormat: 'mp3',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in custom-realtime-conversation:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process conversation',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
