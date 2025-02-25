
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
    const { message, requestType } = await req.json();
    console.log('Received message:', message, 'Request type:', requestType);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemMessage = requestType === 'assessment' 
      ? `You are a professional language assessor. Based on the conversation history with the user, provide a detailed yet concise assessment of their Spanish language skills in the following areas:
         - Reading proficiency
         - Writing ability
         - Speaking competency
         - Listening comprehension
         Also provide an overall estimated proficiency level (A1-C2).
         Format your response as JSON with the following keys: reading, writing, speaking, listening, and overallLevel.`
      : `You are a knowledgeable and patient Spanish language tutor. 
         If user writes in English, respond in Spanish and provide the English translation below prefixed with "Translation:".
         If user writes in Spanish, help correct any grammar or vocabulary mistakes, explain the corrections in English, and provide encouragement.
         Keep responses friendly but concise, focused on language learning.
         Maintain a consistent format with corrections and explanations clearly separated.`;

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

    if (requestType === 'assessment') {
      try {
        const assessment = JSON.parse(data.choices[0].message.content);
        console.log('Formatted assessment:', assessment);
        return new Response(
          JSON.stringify({ assessment }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error parsing assessment JSON:', error);
        throw new Error('Failed to parse assessment response');
      }
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
