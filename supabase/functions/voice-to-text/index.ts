
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, userLanguage, conversationHistory, cefrLevel } = await req.json();
    console.log('Received audio data, processing...');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!audio) {
      throw new Error('No audio data provided');
    }

    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
    
    // Create form data for the Whisper API
    const formData = new FormData();
    formData.append('file', new Blob([binaryData], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // Set the language based on what the user is learning
    const language = userLanguage === 'english' ? 'es' : 'en';
    formData.append('language', language);
    
    console.log('Sending to OpenAI Whisper API...');
    
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: formData
    });

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.json().catch(() => ({}));
      throw new Error(`Failed to transcribe audio: ${whisperResponse.statusText}, ${JSON.stringify(errorData)}`);
    }

    const whisperData = await whisperResponse.json();
    const transcript = whisperData.text;
    
    console.log('Transcription successful:', transcript);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcript: transcript
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in voice-to-text function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing voice data',
        details: error.toString() 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
