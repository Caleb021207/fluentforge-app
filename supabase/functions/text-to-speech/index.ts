
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const voiceMap = {
  english: "nova", // English speaker will hear Spanish in Nova voice
  spanish: "onyx", // Spanish speaker will hear English in Onyx voice
  portuguese: "onyx" // Portuguese speaker will hear English in Onyx voice
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, userLanguage } = await req.json();
    console.log('Text to convert to speech:', text, 'User language:', userLanguage);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Select voice based on user language
    const voice = voiceMap[userLanguage as keyof typeof voiceMap] || "nova";
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        response_format: "mp3"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to generate speech: ${response.statusText}, ${JSON.stringify(errorData)}`);
    }

    // Get binary audio data and convert to base64
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    return new Response(
      JSON.stringify({ success: true, audioContent: audioBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        details: error.toString() 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
