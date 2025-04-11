
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code mapping for better TTS results
const languageVoiceMap: Record<string, string> = {
  "english": "alloy", // Default English voice
  "en": "alloy", // English
  "spanish": "nova",  // Spanish-friendly voice
  "es": "nova", // Spanish
  "portuguese": "nova", // Portuguese-friendly voice
  "pt": "nova", // Portuguese
  "korean": "shimmer", // Korean-friendly voice
  "ko": "shimmer", // Korean
  "arabic": "shimmer", // Arabic-friendly voice
  "ar": "shimmer", // Arabic
  "mandarin": "shimmer", // Mandarin-friendly voice
  "zh": "shimmer", // Chinese
  "vietnamese": "nova", // Vietnamese-friendly voice
  "vi": "nova", // Vietnamese
  "french": "echo", // French-friendly voice
  "fr": "echo", // French
  "japanese": "onyx", // Japanese-friendly voice
  "ja": "onyx", // Japanese
  "russian": "echo", // Russian-friendly voice
  "ru": "echo", // Russian
  "ukrainian": "echo", // Ukrainian-friendly voice
  "uk": "echo", // Ukrainian
  "hindi": "nova", // Hindi-friendly voice
  "hi": "nova", // Hindi
  "indonesian": "nova", // Indonesian-friendly voice
  "id": "nova" // Indonesian
};

// Process base64 in chunks to prevent memory issues
function processBase64(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  const chunkSize = 1024;
  
  // Process in chunks to avoid stack overflow
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binaryString);
}

// Normalize language code
function normalizeLanguageCode(language: string): string {
  if (!language) return 'english';
  
  const lowerLang = language.toLowerCase();
  
  // Handle full codes like en-US
  if (lowerLang.includes('-')) {
    return lowerLang.split('-')[0];
  }
  
  return lowerLang;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, language } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Processing TTS request for language: ${language}, text: ${text.substring(0, 20)}...`);
    
    // Normalize language code
    const normalizedLanguage = normalizeLanguageCode(language);
    console.log(`Normalized language: ${normalizedLanguage}`);
    
    // Determine the best voice based on language or use provided voice
    let selectedVoice = voice;
    if (!selectedVoice) {
      selectedVoice = languageVoiceMap[normalizedLanguage] || 'alloy';
      console.log(`Selected voice ${selectedVoice} for language ${normalizedLanguage}`);
    }

    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = processBase64(arrayBuffer);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    let errorMessage = 'Failed to generate speech. Please try again.';
    if (error.message.includes('API key not configured')) {
      errorMessage = 'The speech service is not properly configured. Please contact support.';
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
