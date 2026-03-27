import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const normalizeLanguage = (lang: string): string => {
  const map: Record<string, string> = {
    'spanish': 'es', 'english': 'en', 'portuguese': 'pt', 'french': 'fr', 'german': 'de',
    'italian': 'it', 'japanese': 'ja', 'korean': 'ko', 'mandarin': 'zh', 'chinese': 'zh',
    'cantonese': 'yue', 'russian': 'ru', 'arabic': 'ar', 'hindi': 'hi', 'urdu': 'ur',
    'bengali': 'bn', 'gujarati': 'gu', 'punjabi': 'pa', 'nepali': 'ne', 'thai': 'th',
    'turkish': 'tr', 'vietnamese': 'vi', 'ukrainian': 'uk', 'indonesian': 'id', 'farsi': 'fa',
    'pashto': 'ps', 'swahili': 'sw', 'somali': 'so', 'yoruba': 'yo', 'amharic': 'am',
    'malayalam': 'ml', 'polish': 'pl', 'romanian': 'ro', 'haitian': 'ht', 'igbo': 'ig', 'tagalog': 'tl',
  };
  return map[lang.toLowerCase().trim()] || lang.toLowerCase().trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { audio, conversationHistory, targetLanguage, userLanguage, userInterfaceLanguage, proficiencyLevel, cefrLevel } = await req.json();
    if (!audio) throw new Error('No audio data provided');

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id || null;
    }

    const levelMap: Record<string, string> = { 'basic': 'A1', 'intermediate': 'B1', 'advanced': 'C1' };
    const level = proficiencyLevel || 'intermediate';
    const effectiveCefrLevel = cefrLevel?.toUpperCase().split('/')[0].replace('+', '') || levelMap[level] || 'B1';

    // Step 1: Transcribe audio
    console.log('Transcribing audio...');
    const transcribeResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/transcribe-audio`, {
      method: 'POST',
      headers: { 'Authorization': authHeader || '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio, language: normalizeLanguage(userLanguage || 'english') }),
    });

    if (!transcribeResponse.ok) {
      const errorText = await transcribeResponse.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const { text: userTranscript } = await transcribeResponse.json();
    console.log(`Transcribed: "${userTranscript}"`);

    // Step 2: Generate response with Lovable AI
    const nativeCode = normalizeLanguage(userLanguage);
    const CEFR_BEHAVIOR: Record<string, { nativePercent: number; englishPercent: number; approach: string }> = {
      'A1': { nativePercent: 60, englishPercent: 40, approach: 'Focus on teaching. Explain in native language, introduce target words gradually.' },
      'A2': { nativePercent: 45, englishPercent: 55, approach: 'Teaching with practice. Mix both languages.' },
      'B1': { nativePercent: 25, englishPercent: 75, approach: 'Balance teaching and practice. Encourage target language.' },
      'B2': { nativePercent: 12, englishPercent: 88, approach: 'Immersive practice. Primarily target language.' },
      'C1': { nativePercent: 5, englishPercent: 95, approach: 'Near-immersion. Almost exclusively target language.' },
      'C2': { nativePercent: 2, englishPercent: 98, approach: 'Full immersion. Native-like interaction.' }
    };
    const currentLevel = CEFR_BEHAVIOR[effectiveCefrLevel] || CEFR_BEHAVIOR['B1'];

    const systemPrompt = `You are an encouraging ${targetLanguage || 'English'} language tutor at CEFR ${effectiveCefrLevel} level.\n\n${currentLevel.approach}\n\nUse ~${currentLevel.englishPercent}% ${targetLanguage} and ~${currentLevel.nativePercent}% ${userInterfaceLanguage || userLanguage}.\n\nKeep responses 2-3 sentences. Use the speak_bilingual function with segments.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: userTranscript }
    ];

    const gptResponse = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 200,
        temperature: 0.8,
        tools: [{
          type: 'function',
          function: {
            name: 'speak_bilingual',
            description: 'Structure a bilingual response with language codes for voice synthesis',
            parameters: {
              type: 'object',
              properties: {
                segments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      lang: { type: 'string', description: 'ISO 639-1 language code' },
                      text: { type: 'string', description: 'Text in that language' },
                    },
                    required: ['lang', 'text'],
                  },
                },
              },
              required: ['segments'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'speak_bilingual' } },
      }),
    });

    if (!gptResponse.ok) throw new Error(`AI generation failed: ${gptResponse.status}`);

    const gptData = await gptResponse.json();
    let segments: Array<{ lang: string; text: string }>;

    const toolCall = gptData.choices[0].message.tool_calls?.[0];
    if (toolCall?.function?.name === 'speak_bilingual') {
      segments = JSON.parse(toolCall.function.arguments).segments;
    } else {
      const textResponse = gptData.choices[0].message.content || '';
      segments = [{ lang: 'en', text: textResponse }];
    }

    const processedSegments = segments.map(s => ({ lang: normalizeLanguage(s.lang), text: s.text.trim() }));
    const aiResponse = processedSegments.map(s => s.text).join(' ');

    // Step 3: Synthesize speech with Azure TTS
    const azureSpeechKey = Deno.env.get('AZURE_SPEECH_KEY') || Deno.env.get('AWS_ACCESS_KEY_ID');
    const azureRegion = Deno.env.get('AZURE_REGION') || Deno.env.get('AWS_REGION') || 'eastus';

    if (!azureSpeechKey) {
      // Return text-only response if no TTS configured
      return new Response(JSON.stringify({
        userTranscript,
        aiResponse,
        segments: processedSegments,
        audioBase64: null,
        ttsError: 'TTS not configured'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const azureVoiceMap: Record<string, string> = {
      'es': 'es-MX-DaliaNeural', 'en': 'en-US-JennyNeural', 'pt': 'pt-BR-FranciscaNeural',
      'fr': 'fr-FR-DeniseNeural', 'de': 'de-DE-KatjaNeural', 'it': 'it-IT-ElsaNeural',
      'ja': 'ja-JP-NanamiNeural', 'ko': 'ko-KR-SunHiNeural', 'zh': 'zh-CN-XiaoxiaoNeural',
      'ru': 'ru-RU-SvetlanaNeural', 'ar': 'ar-SA-ZariyahNeural', 'hi': 'hi-IN-SwaraNeural',
      'tr': 'tr-TR-EmelNeural', 'vi': 'vi-VN-HoaiMyNeural', 'uk': 'uk-UA-PolinaNeural',
      'pl': 'pl-PL-ZofiaNeural', 'ro': 'ro-RO-AlinaNeural',
    };

    const localeMap: Record<string, string> = {
      'es': 'es-MX', 'en': 'en-US', 'pt': 'pt-BR', 'fr': 'fr-FR', 'de': 'de-DE',
      'it': 'it-IT', 'ja': 'ja-JP', 'ko': 'ko-KR', 'zh': 'zh-CN', 'ru': 'ru-RU',
      'ar': 'ar-SA', 'hi': 'hi-IN', 'tr': 'tr-TR', 'vi': 'vi-VN', 'uk': 'uk-UA',
      'pl': 'pl-PL', 'ro': 'ro-RO',
    };

    // Build multi-voice SSML
    let ssmlBody = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">`;
    for (const seg of processedSegments) {
      const voice = azureVoiceMap[seg.lang] || 'en-US-JennyNeural';
      ssmlBody += `<voice name="${voice}">${seg.text}</voice>`;
    }
    ssmlBody += `</speak>`;

    try {
      const ttsResponse = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureSpeechKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssmlBody,
      });

      if (!ttsResponse.ok) throw new Error(`TTS error: ${ttsResponse.status}`);

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(JSON.stringify({
        userTranscript,
        aiResponse,
        segments: processedSegments,
        audioBase64,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (ttsError) {
      console.error('TTS error:', ttsError);
      return new Response(JSON.stringify({
        userTranscript,
        aiResponse,
        segments: processedSegments,
        audioBase64: null,
        ttsError: String(ttsError),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
