
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

// Function to get appropriate voice based on language
function getVoiceForLanguage(language: string): string {
  // OpenAI voices available: alloy, echo, fable, onyx, nova, shimmer
  const languageVoiceMap: Record<string, string> = {
    english: 'echo',    // Male voice for English
    spanish: 'nova',    // Female voice for Spanish
    portuguese: 'alloy' // Neutral voice for Portuguese
  };
  
  return languageVoiceMap[language] || 'echo'; // Default to echo
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
    
    // Prepare form data for audio transcription
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // Add language if provided
    if (userLanguage) {
      // Map user language to OpenAI language code
      const languageMap: Record<string, string> = {
        english: 'en',
        spanish: 'es',
        portuguese: 'pt'
      };
      formData.append('language', languageMap[userLanguage] || 'en');
    }

    console.log("Sending to OpenAI Whisper API for transcription...");

    // Step 1: Transcribe the audio
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error("OpenAI Transcription API error:", errorText);
      throw new Error(`OpenAI Transcription API error: ${errorText}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcribedText = transcriptionResult.text;
    console.log("Transcription successful:", transcribedText);

    // Step 2: Generate AI response using the transcription
    const systemMessage = userLanguage === 'english' 
      ? `You are a friendly and supportive language tutor for Spanish. The user is an English speaker learning Spanish at intermediate level.`
      : userLanguage === 'spanish'
        ? `You are a friendly and supportive language tutor for English. The user is a Spanish speaker learning English at intermediate level.` 
        : `You are a friendly and supportive language tutor for English. The user is a Portuguese speaker learning English at intermediate level.`;
    
    const messages = [
      { role: "system", content: systemMessage },
      // Add previous messages from conversation history if available
      ...(conversationHistory || []).map((msg: any) => ({ 
        role: msg.role, 
        content: msg.content 
      })),
      // Add the transcribed text as a user message
      { role: "user", content: transcribedText }
    ];

    console.log("Sending to OpenAI Chat API...");
    
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 300, // Limiting for faster responses
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("OpenAI Chat API error:", errorText);
      throw new Error(`OpenAI Chat API error: ${errorText}`);
    }

    const chatResult = await chatResponse.json();
    const aiResponseText = chatResult.choices[0].message.content;
    console.log("AI Response generated:", aiResponseText);

    // Step 3: Convert AI text response to speech using OpenAI TTS
    const voice = getVoiceForLanguage(userLanguage);
    console.log(`Using voice ${voice} for language ${userLanguage}`);
    
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: aiResponseText,
        voice: voice,
        response_format: 'mp3',
        speed: 1.0, // Normal speed - can be adjusted between 0.25 and 4.0
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("OpenAI TTS API error:", errorText);
      throw new Error(`OpenAI TTS API error: ${errorText}`);
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await ttsResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    const chunkSize = 1024;
    
    // Process in chunks to avoid stack overflow
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const audioBase64 = btoa(binaryString);
    console.log("Audio response generated successfully");

    // Prepare response including all the data
    return new Response(
      JSON.stringify({ 
        userText: transcribedText,
        assistantText: aiResponseText,
        audioContent: audioBase64,
        updatedHistory: [
          ...(conversationHistory || []),
          { role: "user", content: transcribedText },
          { role: "assistant", content: aiResponseText }
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in voice-conversation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
