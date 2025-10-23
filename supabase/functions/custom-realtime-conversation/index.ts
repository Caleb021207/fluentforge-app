import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize language names to 2-letter codes
const normalizeLanguage = (lang: string): string => {
  const normalized = lang.toLowerCase().trim();
  const languageMap: Record<string, string> = {
    'spanish': 'es',
    'english': 'en',
    'portuguese': 'pt',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'japanese': 'ja',
    'korean': 'ko',
    'mandarin': 'zh',
    'chinese': 'zh',
    'russian': 'ru',
    'arabic': 'ar',
    'hindi': 'hi',
    'urdu': 'ur',
    'bengali': 'bn',
    'gujarati': 'gu',
    'punjabi': 'pa',
    'nepali': 'ne',
    'thai': 'th',
  };
  
  return languageMap[normalized] || normalized;
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
    const { audio, conversationHistory, targetLanguage, userLanguage, userInterfaceLanguage, proficiencyLevel } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const level = proficiencyLevel || 'intermediate';
    console.log(`Custom realtime request - Target: ${targetLanguage}, User: ${userLanguage}, Interface: ${userInterfaceLanguage}, Level: ${level}`);

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

    // Use user's native language for transcription to understand when they speak in their language
    const whisperLanguageCode = languageCodeMap[userLanguage.toLowerCase()] || 'en';
    console.log(`Using Whisper language code: ${whisperLanguageCode} (user native: ${userLanguage})`);

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

    const nativeCode = normalizeLanguage(userLanguage);
    console.log(`Normalized user language: ${userLanguage} -> ${nativeCode}`);

    // Configure teaching approach based on proficiency level
    const levelConfig: Record<string, any> = {
      basic: {
        cefr: 'A1-A2',
        nativePercent: 70,
        englishPercent: 30,
        approach: 'Focus on teaching. Explain concepts in native language, introduce English words and phrases gradually.'
      },
      intermediate: {
        cefr: 'B1',
        nativePercent: 50,
        englishPercent: 50,
        approach: 'Balance teaching and practice. Mix both languages naturally, encourage English but support with native language.'
      },
      advanced: {
        cefr: 'B2-C1',
        nativePercent: 20,
        englishPercent: 80,
        approach: 'Immersive practice. Primarily English, use native language only for complex concepts or when user struggles.'
      }
    };

    const currentLevel = levelConfig[level] || levelConfig.intermediate;

    const systemPrompt = `You are an encouraging English language tutor teaching at ${currentLevel.cefr} level.

USER INFO:
- Native language: ${userLanguage}
- Interface language: ${userInterfaceLanguage || userLanguage}
- Proficiency level: ${level} (${currentLevel.cefr})

TEACHING APPROACH FOR ${currentLevel.cefr.toUpperCase()}:
${currentLevel.approach}

LANGUAGE DISTRIBUTION:
- Use approximately ${currentLevel.englishPercent}% English
- Use approximately ${currentLevel.nativePercent}% ${userInterfaceLanguage || userLanguage}
- Adjust based on user's comfort and understanding

CRITICAL RULES:
1. ONLY use these two languages:
   - English (target language)
   - ${userInterfaceLanguage || userLanguage} (for support and translation)

2. NEVER use any other language (not ${userLanguage !== (userInterfaceLanguage || userLanguage) ? userLanguage : 'Arabic, Hindi, Spanish, or any others'})

3. ALWAYS PROVIDE TRANSLATION:
   - Every response must include BOTH languages
   - Structure: Say something in English, then provide the translation/explanation in ${userInterfaceLanguage || userLanguage}
   - Example structure: "What did you eat today?" [then in native] "¿Qué comiste hoy?"

4. FOR BASIC LEVEL (${currentLevel.cefr}):
   - Start in native language to explain
   - Teach English words/phrases
   - Example: "[In native] Let me teach you how to talk about food. In English, we say 'I ate pizza.'"

5. FOR INTERMEDIATE LEVEL (${currentLevel.cefr}):
   - Natural code-switching
   - Ask in English, provide translation if needed
   - Example: "What's your favorite food?" [if they hesitate, add translation]

6. FOR ADVANCED LEVEL (${currentLevel.cefr}):
   - Primarily English with occasional translations
   - Only translate complex terms
   - Example: "Tell me about your hobbies. By 'hobbies' I mean pasatiempos."

7. AVOID CONFUSION:
   - Don't ask questions like "How do you say X in English?" when you're teaching English
   - Instead: "In English, we say X. Let's practice together."

Keep responses conversational, 2-3 sentences maximum, and always engaging.

TECHNICAL: Use the speak_bilingual function with segments alternating between "en" and "${normalizeLanguage(userInterfaceLanguage || userLanguage)}" as appropriate for the level.`;

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
        model: 'gpt-4o',
        messages,
        max_tokens: 200,
        temperature: 0.8,
        tools: [
          {
            type: 'function',
            function: {
              name: 'speak_bilingual',
              description: 'Structure a bilingual response with explicit language codes for proper voice synthesis',
              parameters: {
                type: 'object',
                properties: {
                  segments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        lang: {
                          type: 'string',
                          description: 'ISO 639-1 language code (e.g., "en" for English, "es" for Spanish)',
                        },
                        text: {
                          type: 'string',
                          description: 'The text content in the specified language',
                        },
                      },
                      required: ['lang', 'text'],
                    },
                  },
                },
                required: ['segments'],
              },
            },
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'speak_bilingual' },
        },
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('GPT API error:', errorText);
      throw new Error(`GPT generation failed: ${errorText}`);
    }

    const gptData = await gptResponse.json();
    const toolCall = gptData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== 'speak_bilingual') {
      throw new Error('GPT did not return expected function call');
    }

    const functionArgs = JSON.parse(toolCall.function.arguments);
    const segments = functionArgs.segments as Array<{ lang: string; text: string }>;
    
    console.log(`Received ${segments.length} structured segments from GPT:`, segments);

    // Trust GPT-4o's language detection completely
    const processedSegments = segments.map(segment => ({
      lang: normalizeLanguage(segment.lang),
      text: segment.text.trim()
    }));

    console.log(`GPT-4o language segments:`, processedSegments.map(s => `${s.lang}: "${s.text.substring(0, 30)}..."`));

    // Combine all text for display (no tags to strip)
    const aiResponse = processedSegments.map(s => s.text).join(' ');
    console.log(`AI Response (combined): "${aiResponse}"`);

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
      'ur': 'ur-PK-UzmaNeural',
      'bn': 'bn-IN-TanishaaNeural',
      'gu': 'gu-IN-DhwaniNeural',
      'pa': 'pa-IN-GurpreetNeural',
      'ne': 'ne-NP-HemkalaNeural',
      'th': 'th-TH-PremwadeeNeural',
    };

    // Map language codes to full locale codes for SSML
    const localeMap: Record<string, string> = {
      'es': 'es-ES',
      'en': 'en-US',
      'pt': 'pt-BR',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ru': 'ru-RU',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'ur': 'ur-PK',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN',
      'ne': 'ne-NP',
      'th': 'th-TH',
    };

    // Use the already normalized segments from GPT-4o
    const normalizedSegments = processedSegments;
    
    console.log(`Normalized segments:`, normalizedSegments.map(s => `${s.lang}: "${s.text.substring(0, 30)}..."`));

    // Build multi-voice SSML with fallback handling
    const voiceElements = normalizedSegments
      .map(segment => {
        const voice = azureVoiceMap[segment.lang] || azureVoiceMap['en'] || 'en-US-AriaNeural';
        const locale = localeMap[segment.lang] || localeMap['en'] || 'en-US';
        
        if (!azureVoiceMap[segment.lang]) {
          console.warn(`⚠️ No voice found for language "${segment.lang}", falling back to English voice`);
        }
        
        console.log(`Using voice "${voice}" (${locale}) for: "${segment.text.substring(0, 30)}..."`);
        return `<voice name='${voice}' xml:lang='${locale}'>${segment.text}</voice>`;
      })
      .join(' ');

    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      ${voiceElements}
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
