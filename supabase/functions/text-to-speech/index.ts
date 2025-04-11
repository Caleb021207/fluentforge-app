
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
  "spanish": "nova",  // Spanish-friendly voice
  "portuguese": "nova", // Portuguese-friendly voice
  "korean": "shimmer", // Korean-friendly voice
  "arabic": "shimmer", // Arabic-friendly voice
  "mandarin": "shimmer", // Mandarin-friendly voice
  "vietnamese": "nova", // Vietnamese-friendly voice
  "french": "echo", // French-friendly voice
  "japanese": "onyx", // Japanese-friendly voice
  "russian": "echo", // Russian-friendly voice
  "ukrainian": "echo", // Ukrainian-friendly voice
  "hindi": "nova", // Hindi-friendly voice
  "indonesian": "nova" // Indonesian-friendly voice
};

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
    
    console.log(`TTS request for language: ${language}, text length: ${text.length}`);

    // Determine the best voice based on language or use provided voice
    let selectedVoice = voice;
    if (!selectedVoice && language) {
      const normalizedLanguage = language.toLowerCase();
      selectedVoice = languageVoiceMap[normalizedLanguage] || 'alloy';
      console.log(`Using voice ${selectedVoice} for language ${normalizedLanguage}`);
    }

    // Trim text if it's too long (OpenAI has a limit)
    const trimmedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;

    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: trimmedText,
        voice: selectedVoice || 'alloy', // Default to alloy if no voice specified
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("OpenAI TTS API error:", errorData || response.statusText);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData) || response.statusText}`);
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    const chunkSize = 1024;
    
    // Process in chunks to avoid stack overflow
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, [...chunk]);
    }
    
    const base64Audio = btoa(binaryString);
    console.log("Successfully generated speech, returning base64 audio");

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
