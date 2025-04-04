
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, requestType, userLanguage, requestTranslation } = await req.json();
    console.log('Received message:', message, 'Request type:', requestType, 'User language:', userLanguage, 'Request translation:', requestTranslation);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Handle translation-only requests
    if (requestType === 'translation') {
      return await handleTranslationRequest(message, 'persian');
    }

    // Specific tutor instructions for Persian
    const tutorInstructions = `You are a kind, helpful, and encouraging AI language tutor specialized in teaching English to Persian (Farsi) speakers.

PRIORITIZE CONVERSATION OVER ALL ELSE. ONLY CORRECT THE USER IF IT IS IMPOSSIBLE TO CONTINUE COMMUNICATING WITHOUT CLARIFYING.

You MUST strictly follow these rules:

1. **Only use grammar, vocabulary, and sentence structures appropriate to an intermediate level.**
2. **Do not correct the user unless they specifically ask.**
3. **Prioritize keeping the conversation flowing.** Ask questions, be friendly, and respond naturally.
4. **Stay in English unless the user asks for clarification in Persian.**
5. **Do NOT use language or expressions beyond an intermediate level.** Simplicity and clarity are more important than accuracy or native-like fluency.

IMPORTANT: ALWAYS provide a translation of your response in Persian (Farsi).
Your response MUST include a translation prefixed with "Translation:" on a new line after your main response.

Keep responses friendly but concise, focused on language learning.
Stay in character as a patient tutor. Don't test the student — just talk with them like a real person. 
You should never converse with the user in a manner that is not appropriate for a k-12 classroom setting.
You should ask questions to continue the conversation if it ever seems to stall.

Pay special attention to proper right-to-left (RTL) formatting for Persian text. Persian is written from right to left.`;

    // Create an initial hidden message to ensure the AI behaves correctly from the start
    const initialHiddenPrompt = "This conversation is just starting. Remember to prioritize conversation flow over corrections. Don't correct grammar errors unless specifically asked. Keep the conversation flowing naturally and ask follow-up questions. ALWAYS provide a translation of your response in Persian.";

    // Add the hidden prompt
    const messages = [
      { role: 'system', content: tutorInstructions },
      { role: 'user', content: initialHiddenPrompt },
      { role: 'assistant', content: "I understand. I'll engage naturally, prioritizing conversation flow over corrections. I'll only correct if explicitly asked or if it's impossible to understand. I'll ask questions to keep the conversation going. I'll always provide translations in Persian." },
      { role: 'user', content: message }
    ];

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

    // Extract translation if available
    if (content.includes('\nTranslation:')) {
      [content, translation] = content.split('\nTranslation:');
      content = content.trim();
      translation = translation.trim();
    }

    // If no translation was provided, make a second API call to translate the response
    if (!translation || translation === '') {
      console.log('No translation provided, getting one now...');
      try {
        const translationResponse = await getTranslation(content, 'persian');
        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          if (translationData.choices?.[0]?.message?.content) {
            translation = translationData.choices[0].message.content.trim();
          }
        }
      } catch (error) {
        console.error('Error getting translation:', error);
        // Continue even if translation fails
      }
    }

    console.log('Formatted response:', { content, translation });

    return new Response(
      JSON.stringify({ content, translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-persian-tutor function:', error);
    
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

// Helper function to get translation for a message
async function getTranslation(message: string, targetLanguage: string) {
  return await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a professional English to Persian (Farsi) translator. Translate the following text from English to Persian. Just return the translation, no explanations. Make sure the Persian text is properly formatted for right-to-left reading.` 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });
}

// Handler for translation-only requests
async function handleTranslationRequest(message: string, userLanguage: string) {
  try {
    const translationResponse = await getTranslation(message, userLanguage);
    
    if (!translationResponse.ok) {
      throw new Error('Failed to get translation from OpenAI');
    }
    
    const translationData = await translationResponse.json();
    const translation = translationData.choices?.[0]?.message?.content || '';
    
    return new Response(
      JSON.stringify({ translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translation request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to translate text', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
