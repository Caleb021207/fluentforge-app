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

    // Step 3: Synthesize speech with Azure TTS
    console.log('Step 3: Synthesizing speech with Azure TTS...');
    
    const azureSpeechKey = Deno.env.get('AZURE_SPEECH_KEY');
    const azureRegion = Deno.env.get('AZURE_REGION') || 'eastus';
    
    if (!azureSpeechKey) {
      throw new Error('Azure Speech key not configured');
    }

    // Map languages to Azure voices
    const azureVoiceMap: Record<string, string> = {
      'es': 'es-ES-ElviraNeural',
      'en': 'en-US-AriaNeural',
      'pt': 'pt-BR-FranciscaNeural',
      'fr': 'fr-FR-DeniseNeural',
      'de': 'de-DE-KatjaNeural',
      'it': 'it-IT-ElsaNeural',
      'ja': 'ja-JP-NanamiNeural',
      'ko': 'ko-KR-SunHiNeural',
      'zh': 'zh-CN-XiaoxiaoNeural',
      'ru': 'ru-RU-SvetlanaNeural',
      'ar': 'ar-SA-ZariyahNeural',
      'hi': 'hi-IN-SwaraNeural',
    };

    const azureVoice = azureVoiceMap[whisperLanguageCode] || 'en-US-AriaNeural';
    console.log(`Using Azure TTS voice: ${azureVoice}`);

    // Create SSML for Azure
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${whisperLanguageCode}'>
      <voice name='${azureVoice}'>${aiResponse}</voice>
    </speak>`;

    const azureTtsResponse = await fetch(
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

    if (!azureTtsResponse.ok) {
      const errorText = await azureTtsResponse.text();
      console.error('Azure TTS error:', errorText);
      throw new Error(`Azure TTS failed: ${errorText}`);
    }

    // Convert audio to base64
    const audioArrayBuffer = await azureTtsResponse.arrayBuffer();
    const bytes = new Uint8Array(audioArrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const audioBase64 = btoa(binary);

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
