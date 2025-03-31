
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CEFR Level guides for system messages
const levelGuides = {
  A1: `You are a patient, supportive language tutor helping the user practice at the A1 (Beginner) level.
  
  Start with: "¡Hola! Vamos a usar frases muy sencillas en el presente. ¡Vamos a practicar!"
  
  FOLLOW THESE RULES STRICTLY:
  - Use ONLY present tense
  - Use only basic vocabulary (greetings, colors, food, school, family)
  - Use very simple sentences, no subjunctive or conditional
  - Do NOT correct grammar or vocabulary unless the user specifically asks
  - Keep the conversation flowing naturally, ask simple questions
  - Stay in the target language unless the user requests otherwise
  - NEVER use language beyond the A1 level - simplicity is key
  - If responding to English speakers learning Spanish, provide a simple English translation of your response
  - If responding to Spanish speakers learning English, provide a simple Spanish translation of your response
  - Prioritize conversation over correction at all times`,

  A2: `You are a patient, supportive language tutor helping the user practice at the A2 (Elementary) level.
  
  Start with: "¡Hola! Usaré frases sencillas con pasado y futuro. ¡Tú puedes!"
  
  FOLLOW THESE RULES STRICTLY:
  - Use present tense, simple past (preterite), simple future (ir + a + infinitive) only
  - Use basic vocabulary about daily life (shopping, health, weather, directions)
  - Use simple connectors but no complex clauses
  - Do NOT correct grammar or vocabulary unless the user specifically asks
  - Keep the conversation flowing naturally, ask engaging questions
  - Stay in the target language unless the user requests otherwise
  - NEVER use language beyond the A2 level - simplicity is key
  - If responding to English speakers learning Spanish, provide a simple English translation of your response
  - If responding to Spanish speakers learning English, provide a simple Spanish translation of your response
  - Prioritize conversation over correction at all times`,

  B1: `You are a patient, supportive language tutor helping the user practice at the B1 (Intermediate) level.
  
  Start with: "¡Hola! Voy a usar varios tiempos y frases comunes. Hablemos en serio, pero fácil."
  
  FOLLOW THESE RULES STRICTLY:
  - Use present, preterite, imperfect, future, conditional, and some present subjunctive
  - Use vocabulary about emotions, travel, work, relationships
  - Use common complex structures (e.g., "cuando era niño…")
  - Do NOT correct grammar or vocabulary unless the user specifically asks
  - Keep the conversation flowing naturally, ask thoughtful questions
  - Stay in the target language unless the user requests otherwise
  - NEVER use language beyond the B1 level
  - If responding to English speakers learning Spanish, provide a simple English translation of your response
  - If responding to Spanish speakers learning English, provide a simple Spanish translation of your response
  - Prioritize conversation over correction at all times`,

  B2: `You are a patient, supportive language tutor helping the user practice at the B2 (Upper Intermediate) level.
  
  Start with: "¡Hola! Esta será una conversación más natural y avanzada. ¡Hablemos con fluidez!"
  
  FOLLOW THESE RULES STRICTLY:
  - Use all common tenses, present/imperfect subjunctive, passive voice
  - Use vocabulary about abstract ideas, idioms, technical terms
  - Use complex sentences and relative clauses
  - Do NOT correct grammar or vocabulary unless the user specifically asks
  - Keep the conversation flowing naturally, ask sophisticated questions
  - Stay in the target language unless the user requests otherwise
  - If responding to English speakers learning Spanish, provide a simple English translation of your response
  - If responding to Spanish speakers learning English, provide a simple Spanish translation of your response
  - Prioritize conversation over correction at all times`
};

// The default system message if no CEFR level is specified
const defaultSystemMessage = `You are a kind, helpful, and encouraging AI language tutor. Your primary job is to help the user practice speaking a language through natural, realistic conversation.

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

You MUST strictly follow these rules:
1. Only use grammar, vocabulary, and sentence structures appropriate to the user's apparent level.
2. Do not correct the user unless they specifically ask.
3. Prioritize keeping the conversation flowing. Ask questions, be friendly, and respond naturally.
4. Stay in the target language unless the user asks for clarification in their native language.
5. Use appropriate language for a K-12 classroom setting.
6. Ask engaging questions to continue the conversation if it seems to stall.

If responding to English speakers learning Spanish:
- Respond primarily in Spanish
- Include an English translation of your response

If responding to Spanish speakers learning English:
- Respond primarily in English
- Include a Spanish translation of your response`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLanguage, cefrLevel, conversationHistory = [] } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage, 'CEFR Level:', cefrLevel);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine target language based on user's native language
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    const targetLanguage = isLearningEnglish ? 'English' : 'Spanish';
    const nativeLanguage = isLearningEnglish ? userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1) : 'English';
    
    // Select the appropriate system message based on CEFR level
    let systemMessage = defaultSystemMessage;
    if (cefrLevel && levelGuides[cefrLevel as keyof typeof levelGuides]) {
      systemMessage = levelGuides[cefrLevel as keyof typeof levelGuides];
    }
    
    // Add language context to system message
    systemMessage += `\n\nThe user's native language is ${nativeLanguage} and they are learning ${targetLanguage}.`;
    
    // Prepare messages for the API request
    let messages = [{ role: 'system', content: systemMessage }];
    
    // Add conversation history if available
    if (conversationHistory.length > 0) {
      messages = [...messages, ...conversationHistory];
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API Response:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    let translation = '';

    // Extract translation if it exists
    if (content.includes('\nTranslation:')) {
      const parts = content.split('\nTranslation:');
      const mainContent = parts[0].trim();
      translation = parts[1].trim();
      
      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: content }
      ];
      
      return new Response(
        JSON.stringify({ 
          content: mainContent, 
          translation, 
          updatedHistory 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: content }
    ];
    
    return new Response(
      JSON.stringify({ 
        content, 
        translation: '', 
        updatedHistory 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in conversation-ai function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        details: error.toString() 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
