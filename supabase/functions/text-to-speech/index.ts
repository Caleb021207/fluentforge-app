
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PollyClient, SynthesizeSpeechCommand } from "npm:@aws-sdk/client-polly";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code mapping for better Polly voices
const languageVoiceMap: Record<string, { voiceId: string, engine: string }> = {
  "english": { voiceId: "Matthew", engine: "neural" },
  "spanish": { voiceId: "Lupe", engine: "neural" },
  "portuguese": { voiceId: "Camila", engine: "neural" },
  "korean": { voiceId: "Seoyeon", engine: "neural" },
  "french": { voiceId: "Lea", engine: "neural" },
  "japanese": { voiceId: "Takumi", engine: "neural" },
  "mandarin": { voiceId: "Zhiyu", engine: "neural" },
  "hindi": { voiceId: "Kajal", engine: "neural" },
  "indonesian": { voiceId: "Siti", engine: "standard" }, // Standard engine as neural not available
};

// Maximum retries for API calls
const MAX_RETRIES = 1;
const RETRY_DELAY = 500;

// Function to retry API calls
async function fetchWithRetry(client: PollyClient, command: SynthesizeSpeechCommand, retries = MAX_RETRIES) {
  try {
    const response = await client.send(command);
    if (!response.AudioStream) {
      throw new Error('No audio stream in response');
    }
    return response;
  } catch (error) {
    if (retries > 0 && (error.name === 'NetworkError' || error.name === 'ThrottlingException')) {
      console.log(`Retrying due to ${error.name}... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(client, command, retries - 1);
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`TTS request for language: ${language}, text length: ${text.length}`);

    // Initialize Polly client
    const polly = new PollyClient({
      region: "us-east-1", // Using US East 1 as it has all voices available
      credentials: {
        accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID")!,
        secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
      },
    });

    // Get voice settings based on language
    const voiceSettings = languageVoiceMap[language?.toLowerCase()] || languageVoiceMap["english"];

    // Trim text if it's too long (Polly has a 3000 character limit)
    const trimmedText = text.length > 3000 ? text.substring(0, 3000) + "..." : text;

    const command = new SynthesizeSpeechCommand({
      Engine: voiceSettings.engine,
      OutputFormat: "mp3",
      Text: trimmedText,
      VoiceId: voiceSettings.voiceId,
    });

    // Generate speech with retry logic
    const response = await fetchWithRetry(polly, command);
    const audioArray = await response.AudioStream?.transformToByteArray();
    const base64Audio = btoa(String.fromCharCode(...audioArray));

    console.log("Successfully generated speech, returning base64 audio");

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    let errorMessage = 'Failed to generate speech. Please try again.';
    if (error.message.includes('credentials')) {
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
