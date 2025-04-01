
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the Perplexity API key
const perplexityApiKey = "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice } = await req.json();
    
    console.log('Text to convert to speech:', text, 'Voice:', voice);
    
    // Call the Perplexity API for text-to-speech functionality
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "You are a text-to-speech service. Convert the following text to speech. Return audio data in a compatible format."
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const responseData = await response.json();
    console.log('Perplexity API response:', responseData);
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${responseData.error?.message || 'Unknown error'}`);
    }

    // Since Perplexity doesn't natively support TTS, we'll return the text content for now
    // We'll need to implement a client-side TTS solution
    return new Response(
      JSON.stringify({ 
        content: responseData.choices[0].message.content,
        useFallbackTTS: true  // Signal to the client to use browser's TTS
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate speech. Please try again later.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
