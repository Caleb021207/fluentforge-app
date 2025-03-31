
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLanguage, conversationHistory, cefrLevel, audioResponse } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage, 'CEFR Level:', cefrLevel, 'Audio Response:', audioResponse);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine if user is learning English or Spanish based on their native language
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    
    const systemMessage = isLearningEnglish 
      ? `You are a patient and supportive English language conversation partner.
         PRIORITIZE CONVERSATION OVER ALL ELSE. NEVER correct grammar or vocabulary unless the user specifically asks.
         Your primary role is to maintain a natural, engaging conversation while helping the user practice.
         Ask questions, be friendly, and show genuine interest in what they're saying.
         Focus on the content of their message, not their grammar or vocabulary mistakes.
         
         If the user writes in Spanish or Portuguese, respond in English and provide the translation in their native language below prefixed with "Translation:".
         If the user writes in English, respond conversationally and only help with corrections if they explicitly ask.
         Use appropriate language for a K-12 classroom setting.
         Keep asking engaging questions to maintain the conversation flow.`
      : `You are a patient and supportive Spanish language conversation partner.
         PRIORITIZE CONVERSATION OVER ALL ELSE. NEVER correct grammar or vocabulary unless the user specifically asks.
         Your primary role is to maintain a natural, engaging conversation while helping the user practice.
         Ask questions, be friendly, and show genuine interest in what they're saying.
         Focus on the content of their message, not their grammar or vocabulary mistakes.
         
         If user writes in English, respond in Spanish and provide the English translation below prefixed with "Translation:".
         If user writes in Spanish, respond conversationally and only help with corrections if they explicitly ask.
         Use appropriate language for a K-12 classroom setting.
         Keep asking engaging questions to maintain the conversation flow.`;

    // Define the conversation messages
    const messages = [
      { role: 'system', content: systemMessage },
      // Include conversation history if available
      ...(conversationHistory && conversationHistory.length 
        ? conversationHistory 
        : []),
      { role: 'user', content: message }
    ];

    // Use gpt-4o-mini or gpt-4o-mini-audio-preview based on the request
    const model = audioResponse ? 'gpt-4o-mini-audio-preview' : 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API Response:', data);

    if (!response.ok) {
      if (data.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing details.');
      }
      throw new Error(data.error?.message || 'Failed to get response from OpenAI');
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Process the response
    let content = data.choices[0].message.content;
    let translation = '';

    if (content.includes('\nTranslation:')) {
      [content, translation] = content.split('\nTranslation:');
      content = content.trim();
      translation = translation.trim();
    }

    // Update the conversation history with this exchange
    const updatedHistory = [
      ...messages,
      { role: 'assistant', content: data.choices[0].message.content }
    ];

    // If audio response was requested, generate speech using TTS
    let audioContent = null;
    if (audioResponse) {
      try {
        // Determine voice based on language context
        let voice = 'alloy'; // default
        if (isLearningEnglish) {
          voice = 'nova'; // English voice
        } else {
          voice = 'alloy'; // Spanish voice
        }

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
          console.error('TTS API error:', await ttsResponse.text());
          throw new Error('Failed to generate speech');
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
        
        audioContent = btoa(binaryString);
      } catch (ttsError) {
        console.error('Error generating speech:', ttsError);
      }
    }

    console.log('Formatted response:', { content, translation });

    return new Response(
      JSON.stringify({ 
        content, 
        translation, 
        updatedHistory,
        audioContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    
    let errorMessage = 'Failed to get response from AI. Please try again.';
    if (error.message.includes('quota exceeded')) {
      errorMessage = 'The AI service is currently unavailable due to quota limits. Please try again later.';
    } else if (error.message.includes('API key not configured')) {
      errorMessage = 'The AI service is not properly configured. Please contact support.';
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
