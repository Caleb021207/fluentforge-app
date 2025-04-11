
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code mapping for better TTS results
const languageVoiceMap: Record<string, string> = {
  "english": "alloy",   // Default English voice
  "spanish": "nova",    // Spanish-friendly voice
  "portuguese": "nova", // Portuguese-friendly voice
  "korean": "shimmer",  // Korean-friendly voice
  "arabic": "shimmer",  // Arabic-friendly voice
  "mandarin": "onyx",   // Mandarin-friendly voice
  "vietnamese": "nova", // Vietnamese-friendly voice
  "french": "echo",     // French-friendly voice
  "japanese": "onyx",   // Japanese-friendly voice
  "russian": "echo",    // Russian-friendly voice
  "ukrainian": "echo",  // Ukrainian-friendly voice
  "hindi": "nova",      // Hindi-friendly voice
  "indonesian": "nova"  // Indonesian-friendly voice
};

// Maximum retries for API calls (reduced)
const MAX_RETRIES = 1;
const RETRY_DELAY = 500; // ms (reduced from 1000)

// Function to retry API calls only for network errors and rate limits
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    // Only retry on rate limits or potential network issues
    if (retries > 0 && (response.status === 429 || response.status >= 500)) {
      console.log(`Retrying due to status ${response.status}... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`API error: ${JSON.stringify(errorData)}`);
  } catch (error) {
    if (retries > 0 && error.message.includes('fetch failed')) {
      console.log(`Network error, retrying... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// More efficient base64 conversion for large audio files
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 2048; // Increased chunk size for better performance
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, [...chunk]);
  }
  
  return btoa(binary);
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

    // Generate speech from text with optimized retry logic
    const response = await fetchWithRetry('https://api.openai.com/v1/audio/speech', {
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

    // Convert audio buffer to base64 with improved method
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = bufferToBase64(arrayBuffer);
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
