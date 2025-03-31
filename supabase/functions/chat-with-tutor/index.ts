
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "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";

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
    const { message, userLanguage, cefrLevel } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage, 'CEFR Level:', cefrLevel);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine if user is learning English or Spanish based on their native language
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    
    // Select the appropriate system message based on CEFR level or use default
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
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

    let content = data.choices[0].message.content;
    let translation = '';

    if (content.includes('\nTranslation:')) {
      [content, translation] = content.split('\nTranslation:');
      content = content.trim();
      translation = translation.trim();
    }

    console.log('Formatted response:', { content, translation });

    return new Response(
      JSON.stringify({ content, translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-tutor function:', error);
    
    let errorMessage = 'Failed to get response from AI tutor. Please try again.';
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
