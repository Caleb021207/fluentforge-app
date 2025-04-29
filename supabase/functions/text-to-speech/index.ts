
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code mapping for Azure Cognitive Services
const languageVoiceMap: Record<string, { languageCode: string, voiceName: string }> = {
  "english": { languageCode: "en-US", voiceName: "en-US-GuyNeural" },
  "spanish": { languageCode: "es-ES", voiceName: "es-ES-AlvaroNeural" },
  "portuguese": { languageCode: "pt-BR", voiceName: "pt-BR-AntonioNeural" },
  "korean": { languageCode: "ko-KR", voiceName: "ko-KR-InJoonNeural" },
  "french": { languageCode: "fr-FR", voiceName: "fr-FR-HenriNeural" },
  "japanese": { languageCode: "ja-JP", voiceName: "ja-JP-KeitaNeural" },
  "mandarin": { languageCode: "zh-CN", voiceName: "zh-CN-YunxiNeural" }, 
  "hindi": { languageCode: "hi-IN", voiceName: "hi-IN-MadhurNeural" },
  "indonesian": { languageCode: "id-ID", voiceName: "id-ID-ArdiNeural" },
  "farsi": { languageCode: "fa-IR", voiceName: "fa-IR-FaridNeural" }, // Azure supports Farsi!
  "russian": { languageCode: "ru-RU", voiceName: "ru-RU-DmitryNeural" },
  "arabic": { languageCode: "ar-SA", voiceName: "ar-SA-HamedNeural" },
  "vietnamese": { languageCode: "vi-VN", voiceName: "vi-VN-NamMinhNeural" },
  "ukrainian": { languageCode: "uk-UA", voiceName: "uk-UA-OstapNeural" }
};

// Maximum character count per chunk (Azure TTS limit is 10000)
const MAX_CHUNK_SIZE = 9500;
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

// Get Azure access token
async function getAzureToken(): Promise<string> {
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY');
  const AZURE_REGION = Deno.env.get('AZURE_REGION') || 'eastus';
  
  if (!AZURE_SPEECH_KEY) {
    throw new Error('Azure Speech key is not configured');
  }

  try {
    const response = await fetch(
      `https://${AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get Azure token: ${await response.text()}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error getting Azure token:', error);
    throw error;
  }
}

// Convert text to speech with Azure
async function textToSpeechAzure(text: string, voice: string, language: string): Promise<ArrayBuffer> {
  const AZURE_REGION = Deno.env.get('AZURE_REGION') || 'eastus';
  const token = await getAzureToken();
  
  // Prepare SSML document
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
      <voice name="${voice}">
        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}
      </voice>
    </speak>
  `;

  const response = await fetch(
    `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'TextToSpeechFunction'
      },
      body: ssml
    }
  );

  if (!response.ok) {
    throw new Error(`Azure TTS failed: ${await response.text()}`);
  }

  return await response.arrayBuffer();
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
      
      // Convert text to speech using Azure
      return await textToSpeechAzure(
        chunk, 
        voiceSettings.voiceName,
        voiceSettings.languageCode
      );
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
    if (error.message.includes('Azure Speech key')) {
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
