
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

// Maximum character count per chunk (Amazon Polly limit is 3000)
const MAX_CHUNK_SIZE = 2800;
const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

// Helper function to split text into chunks at sentence boundaries
function splitTextIntoChunks(text: string, maxChunkSize: number = MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    if (remainingText.length <= maxChunkSize) {
      chunks.push(remainingText);
      break;
    }

    // Find a good splitting point (end of sentence)
    let splitPoint = remainingText.lastIndexOf('. ', maxChunkSize);
    
    if (splitPoint === -1) {
      // If no period found, try other sentence endings
      splitPoint = remainingText.lastIndexOf('! ', maxChunkSize);
    }
    
    if (splitPoint === -1) {
      splitPoint = remainingText.lastIndexOf('? ', maxChunkSize);
    }
    
    if (splitPoint === -1) {
      // If no sentence break found, look for commas
      splitPoint = remainingText.lastIndexOf(', ', maxChunkSize);
    }

    if (splitPoint === -1) {
      // If no good breaking point, just split at maxChunkSize
      splitPoint = maxChunkSize;
    } else {
      // Include the punctuation mark and space
      splitPoint += 2;
    }

    chunks.push(remainingText.substring(0, splitPoint));
    remainingText = remainingText.substring(splitPoint);
  }

  return chunks;
}

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

// Efficiently process a chunk to base64
function processAudioToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const CHUNK_SIZE = 4096;
  let result = '';
  
  // Process in smaller chunks to prevent memory issues
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, Math.min(i + CHUNK_SIZE, bytes.length));
    result += String.fromCharCode.apply(null, [...chunk]);
  }
  
  return btoa(result);
}

// Concatenate audio streams (MP3 format)
async function concatenateAudioStreams(audioStreams: ArrayBuffer[]): Promise<ArrayBuffer> {
  if (audioStreams.length === 1) {
    return audioStreams[0];
  }
  
  // For MP3, we can simply concatenate the data
  const totalLength = audioStreams.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const buffer of audioStreams) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return result.buffer;
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

    // Split text into chunks if too long
    const textChunks = splitTextIntoChunks(text);
    console.log(`Split text into ${textChunks.length} chunks`);

    // Process each chunk in parallel
    const audioPromises = textChunks.map(async (chunk, index) => {
      console.log(`Processing chunk ${index + 1}/${textChunks.length}, length: ${chunk.length}`);
      
      const command = new SynthesizeSpeechCommand({
        Engine: voiceSettings.engine,
        OutputFormat: "mp3",
        Text: chunk,
        VoiceId: voiceSettings.voiceId,
      });

      // Generate speech with retry logic
      const response = await fetchWithRetry(polly, command);
      return await response.AudioStream?.transformToByteArray();
    });

    // Wait for all audio chunks to be generated
    const audioBuffers = await Promise.all(audioPromises);
    
    // Concatenate audio streams
    const combinedAudio = await concatenateAudioStreams(audioBuffers.map(buffer => buffer.buffer));
    
    // Process to base64 efficiently
    const base64Audio = processAudioToBase64(combinedAudio);

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
