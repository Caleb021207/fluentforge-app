
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language code mapping with information about which TTS service to use
const languageVoiceMap: Record<string, { languageCode: string, voiceName: string }> = {
  "english": { languageCode: "en-US", voiceName: "en-US-JennyNeural" },
  "spanish": { languageCode: "es-ES", voiceName: "es-ES-AlvaroNeural" },
  "portuguese": { languageCode: "pt-BR", voiceName: "pt-BR-AntonioNeural" },
  "korean": { languageCode: "ko-KR", voiceName: "ko-KR-InJoonNeural" },
  "french": { languageCode: "fr-FR", voiceName: "fr-FR-HenriNeural" },
  "japanese": { languageCode: "ja-JP", voiceName: "ja-JP-KeitaNeural" },
  "mandarin": { languageCode: "zh-CN", voiceName: "zh-CN-YunxiNeural" }, 
  "hindi": { languageCode: "hi-IN", voiceName: "hi-IN-MadhurNeural" },
  "indonesian": { languageCode: "id-ID", voiceName: "id-ID-ArdiNeural" },
  "farsi": { languageCode: "fa-IR", voiceName: "fa-IR-FaridNeural" },
  "russian": { languageCode: "ru-RU", voiceName: "ru-RU-DmitryNeural" },
  "arabic": { languageCode: "ar-SA", voiceName: "ar-SA-HamedNeural" },
  "vietnamese": { languageCode: "vi-VN", voiceName: "vi-VN-NamMinhNeural" },
  "ukrainian": { languageCode: "uk-UA", voiceName: "uk-UA-OstapNeural" },
  "urdu": { languageCode: "ur-PK", voiceName: "ur-PK-AsadNeural" },
  "pashto": { languageCode: "ps-AF", voiceName: "ps-AF-GulNawazNeural" }
};

// Polly voice mapping
const pollyVoiceMap: Record<string, string> = {
  "english": "Joanna",
  "spanish": "Lupe",
  "portuguese": "Camila",
  "french": "Léa",
  "japanese": "Takumi",
  "korean": "Seoyeon",
  "mandarin": "Zhiyu",
  "hindi": "Kajal",
  "indonesian": "Danendra", // Fictional - may need to use another language if this doesn't exist
  "farsi": "Lupe", // Use Spanish voice as fallback (might not be ideal)
  "russian": "Tatyana",
  "arabic": "Hala",
  "vietnamese": "Hiếu", // Fictional - may need to use another language if this doesn't exist
  "ukrainian": "Tatyana", // Use Russian voice as fallback
  "urdu": "Kajal", // Use Hindi voice as fallback
  "pashto": "Kajal" // Use Hindi voice as fallback
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
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY') || '7QiOIwzneRTyQdfBRbkNTNCkQEqAnR3RLwF0IEIG4resGOP1WfbeJQQJ99BDACYeBjFXJ3w3AAAYACOGMQxo';
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

// Convert text to speech with AWS Polly
async function textToSpeechPolly(text: string, voiceName: string): Promise<ArrayBuffer> {
  const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
  const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not configured');
  }

  // AWS Signature V4 process
  const host = `polly.${AWS_REGION}.amazonaws.com`;
  const endpoint = `https://${host}/v1/speech`;
  const service = 'polly';
  const method = 'POST';
  
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const datestamp = timestamp.slice(0, 8);

  // Request body
  const body = JSON.stringify({
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceName,
    Engine: 'neural'
  });

  // Create canonical request
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${timestamp}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  
  const payloadHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(body)
  ).then(hash => Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  );
  
  const canonicalRequest = [
    method,
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${datestamp}/${AWS_REGION}/${service}/aws4_request`;
  
  const canonicalRequestHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalRequest)
  ).then(hash => Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  );
  
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature
  async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
    const keyObj = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
    return await crypto.subtle.sign(
      'HMAC',
      keyObj,
      new TextEncoder().encode(message)
    );
  }
  
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${AWS_SECRET_ACCESS_KEY}`),
    datestamp
  );
  const kRegion = await hmacSha256(kDate, AWS_REGION);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  
  const signature = await hmacSha256(kSigning, stringToSign).then(
    hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
  
  // Create authorization header
  const authorizationHeader = [
    `${algorithm} Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ');
  
  // Send request
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'Authorization': authorizationHeader
    },
    body
  });
  
  if (!response.ok) {
    throw new Error(`Polly TTS failed: ${await response.text()}`);
  }
  
  return await response.arrayBuffer();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, isTargetLanguage } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`TTS request for language: ${language}, text length: ${text.length}, isTargetLanguage: ${isTargetLanguage}`);

    // Get voice settings based on language
    const voiceSettings = languageVoiceMap[language?.toLowerCase()] || languageVoiceMap["english"];

    // Split text into chunks if too long
    const textChunks = splitTextIntoChunks(text);
    console.log(`Split text into ${textChunks.length} chunks`);

    // Process each chunk in parallel
    const audioPromises = textChunks.map(async (chunk, index) => {
      console.log(`Processing chunk ${index + 1}/${textChunks.length}, length: ${chunk.length}`);
      
      // Determine which TTS service to use - use Polly for target language, Azure for native language
      let audioBuffer;
      
      if (isTargetLanguage === true) {
        // Use Polly for target language
        try {
          const pollyVoice = pollyVoiceMap[language?.toLowerCase()] || "Joanna";
          console.log(`Using AWS Polly for target language with voice: ${pollyVoice}`);
          audioBuffer = await textToSpeechPolly(chunk, pollyVoice);
        } catch (error) {
          console.error(`Polly TTS failed, falling back to Azure: ${error}`);
          // Fallback to Azure if Polly fails
          audioBuffer = await textToSpeechAzure(
            chunk, 
            voiceSettings.voiceName,
            voiceSettings.languageCode
          );
        }
      } else {
        // Use Azure for native language
        console.log(`Using Azure for native language with voice: ${voiceSettings.voiceName}`);
        audioBuffer = await textToSpeechAzure(
          chunk, 
          voiceSettings.voiceName,
          voiceSettings.languageCode
        );
      }
      
      return audioBuffer;
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
    } else if (error.message.includes('AWS credentials')) {
      errorMessage = 'AWS Polly is not properly configured. Please contact support.';
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
