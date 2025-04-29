
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code mapping for Google Cloud Text-to-Speech
const languageVoiceMap: Record<string, { languageCode: string, voiceName: string }> = {
  "english": { languageCode: "en-US", voiceName: "en-US-Neural2-D" },
  "spanish": { languageCode: "es-ES", voiceName: "es-ES-Neural2-C" },
  "portuguese": { languageCode: "pt-BR", voiceName: "pt-BR-Neural2-B" },
  "korean": { languageCode: "ko-KR", voiceName: "ko-KR-Neural2-C" },
  "french": { languageCode: "fr-FR", voiceName: "fr-FR-Neural2-A" },
  "japanese": { languageCode: "ja-JP", voiceName: "ja-JP-Neural2-C" },
  "mandarin": { languageCode: "cmn-CN", voiceName: "cmn-CN-Neural2-A" }, 
  "hindi": { languageCode: "hi-IN", voiceName: "hi-IN-Neural2-B" },
  "indonesian": { languageCode: "id-ID", voiceName: "id-ID-Neural2-A" },
  "farsi": { languageCode: "fa-IR", voiceName: "fa-IR-Wavenet-A" }, // Google Cloud supports Farsi!
};

// Maximum character count per chunk (Google Cloud TTS limit is 5000)
const MAX_CHUNK_SIZE = 4800;
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
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }
    return response;
  } catch (error) {
    if (retries > 0 && (error.name === 'NetworkError' || error.name === 'TypeError' || error.message.includes('429') || error.message.includes('500'))) {
      console.log(`Retrying due to ${error.message}... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
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

    // Get voice settings based on language
    const voiceSettings = languageVoiceMap[language?.toLowerCase()] || languageVoiceMap["english"];

    // Split text into chunks if too long
    const textChunks = splitTextIntoChunks(text);
    console.log(`Split text into ${textChunks.length} chunks`);

    // Process each chunk in parallel
    const audioPromises = textChunks.map(async (chunk, index) => {
      console.log(`Processing chunk ${index + 1}/${textChunks.length}, length: ${chunk.length}`);
      
      // Prepare request body for Google Cloud TTS
      const requestBody = {
        input: { text: chunk },
        voice: {
          languageCode: voiceSettings.languageCode,
          name: voiceSettings.voiceName
        },
        audioConfig: { audioEncoding: 'MP3' }
      };

      // Google Cloud TTS API request
      const response = await fetchWithRetry(
        'https://texttospeech.googleapis.com/v1/text:synthesize',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('GOOGLE_CLOUD_TOKEN')}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      // Process the response
      const data = await response.json();
      if (!data.audioContent) {
        throw new Error('No audio content in response');
      }

      // Decode base64 audio to binary
      const audioBytes = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioBytes.length);
      const bytes = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioBytes.length; i++) {
        bytes[i] = audioBytes.charCodeAt(i);
      }

      return arrayBuffer;
    });

    // Wait for all audio chunks to be generated
    const audioBuffers = await Promise.all(audioPromises);
    
    // Concatenate audio streams
    const combinedAudio = await concatenateAudioStreams(audioBuffers);
    
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
    if (error.message.includes('Authorization')) {
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
