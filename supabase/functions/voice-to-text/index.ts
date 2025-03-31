
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { audio, userLanguage, conversationHistory } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log("Received audio data, processing...");
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // Set language based on user's native language
    const language = userLanguage === 'english' ? 'es' : 'en';
    formData.append('language', language);

    console.log("Sending to OpenAI Whisper API...");

    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription successful:", result.text);
    
    // Now, use the transcript to generate a response from the GPT model
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    
    const systemMessage = isLearningEnglish 
      ? `You are a knowledgeable and patient English language tutor. 
         Respond in English and provide the translation in the user's native language below prefixed with "Translation:".
         Keep responses friendly but concise, focused on language learning.`
      : `You are a knowledgeable and patient Spanish language tutor. 
         Respond in Spanish and provide the English translation below prefixed with "Translation:".
         Keep responses friendly but concise, focused on language learning.`;

    // Generate response using GPT-4o-mini
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          ...(conversationHistory || []),
          { role: 'user', content: result.text }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const gptData = await gptResponse.json();
    
    if (!gptResponse.ok) {
      throw new Error(`GPT API error: ${gptData.error?.message || 'Unknown error'}`);
    }

    // Process the response
    let content = gptData.choices[0].message.content;
    let translation = '';

    if (content.includes('\nTranslation:')) {
      [content, translation] = content.split('\nTranslation:');
      content = content.trim();
      translation = translation.trim();
    }

    // Generate speech response
    const voice = isLearningEnglish ? 'nova' : 'alloy'; // English or Spanish voice
    
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: content,
        voice,
        response_format: 'mp3',
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error(`TTS API error: ${await ttsResponse.text()}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await ttsResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    
    // Process in chunks to avoid stack overflow
    const chunkSize = 1024;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, chunk);
    }
    
    const audioContent = btoa(binaryString);

    // Update the conversation history
    const updatedHistory = [
      ...(conversationHistory || []),
      { role: 'user', content: result.text },
      { role: 'assistant', content: gptData.choices[0].message.content }
    ];

    return new Response(
      JSON.stringify({ 
        transcript: result.text,
        response: content,
        translation,
        audioContent,
        updatedHistory
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in voice-to-text function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
