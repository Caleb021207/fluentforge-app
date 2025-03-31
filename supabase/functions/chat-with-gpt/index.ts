
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CEFR Level guides for system messages
const levelGuides = {
  A1: `You are a kind, helpful, and encouraging AI language tutor.
  
  Start with: "¡Hola! Vamos a usar frases muy sencillas en el presente. ¡Vamos a practicar!"
  
  FOLLOW THESE RULES STRICTLY:
  - Use ONLY present tense
  - Use only basic vocabulary (greetings, colors, food, school, family)
  - Use very simple sentences, no subjunctive or conditional
  - DO NOT correct grammar or vocabulary unless the user specifically asks
  - PRIORITIZE CONVERSATION OVER ALL ELSE
  - Keep asking engaging questions to maintain a natural flow
  - Stay in the target language unless the user requests otherwise
  - NEVER use language beyond the A1 level - simplicity is key`,

  A2: `You are a kind, helpful, and encouraging AI language tutor.
  
  Start with: "¡Hola! Usaré frases sencillas con pasado y futuro. ¡Tú puedes!"
  
  FOLLOW THESE RULES STRICTLY:
  - Use present tense, simple past (preterite), simple future (ir + a + infinitive) only
  - Use basic vocabulary about daily life (shopping, health, weather, directions)
  - Use simple connectors but no complex clauses
  - DO NOT correct grammar or vocabulary unless the user specifically asks
  - PRIORITIZE CONVERSATION OVER ALL ELSE
  - Keep asking engaging questions to maintain a natural flow
  - Stay in the target language unless the user requests otherwise
  - NEVER use language beyond the A2 level - simplicity is key`,

  B1: `You are a kind, helpful, and encouraging AI language tutor.
  
  Start with: "¡Hola! Voy a usar varios tiempos y frases comunes. Hablemos en serio, pero fácil."
  
  FOLLOW THESE RULES STRICTLY:
  - Use present, preterite, imperfect, future, conditional, and some present subjunctive
  - Use vocabulary about emotions, travel, work, relationships
  - Use common complex structures (e.g., "cuando era niño…")
  - DO NOT correct grammar or vocabulary unless the user specifically asks
  - PRIORITIZE CONVERSATION OVER ALL ELSE
  - Keep asking engaging questions to maintain a natural flow
  - Stay in the target language unless the user requests otherwise
  - NEVER use language beyond the B1 level`,

  B2: `You are a kind, helpful, and encouraging AI language tutor.
  
  Start with: "¡Hola! Esta será una conversación más natural y avanzada. ¡Hablemos con fluidez!"
  
  FOLLOW THESE RULES STRICTLY:
  - Use all common tenses, present/imperfect subjunctive, passive voice
  - Use vocabulary about abstract ideas, idioms, technical terms
  - Use complex sentences and relative clauses
  - DO NOT correct grammar or vocabulary unless the user specifically asks
  - PRIORITIZE CONVERSATION OVER ALL ELSE
  - Keep asking engaging questions to maintain a natural flow
  - Stay in the target language unless the user requests otherwise`
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
    
    // Select appropriate system message based on CEFR level or use default
    let systemMessage = `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice speaking a language through natural, realistic conversation.

    PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.
    
    You MUST strictly follow these rules:
    1. Only use grammar, vocabulary, and sentence structures appropriate to the user's apparent level.
    2. Do not correct the user unless they specifically ask.
    3. Prioritize keeping the conversation flowing. Ask questions, be friendly, and respond naturally.
    4. Stay in the target language unless the user asks for clarification in their native language.
    5. Use appropriate language for a K-12 classroom setting.
    6. Ask engaging questions to continue the conversation if it seems to stall.`;
    
    if (cefrLevel && levelGuides[cefrLevel]) {
      systemMessage = levelGuides[cefrLevel];
    }
    
    // Add language context to the system message
    if (isLearningEnglish) {
      systemMessage += `\n\nThe user is a ${userLanguage} speaker learning English. 
      If they write in ${userLanguage}, respond in English and provide a ${userLanguage} translation below prefixed with "Translation:".
      If they write in English, respond conversationally and only help with corrections if they explicitly ask.`;
    } else {
      systemMessage += `\n\nThe user is an English speaker learning Spanish. 
      If they write in English, respond in Spanish and provide an English translation below prefixed with "Translation:".
      If they write in Spanish, respond conversationally and only help with corrections if they explicitly ask.`;
    }

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
