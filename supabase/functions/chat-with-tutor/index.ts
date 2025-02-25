
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful Spanish language tutor. Your goal is to help users practice Spanish through conversation.
            When users write in English, respond in Spanish with an English translation.
            When users write in Spanish, help correct any grammar mistakes and explain the corrections.
            Keep responses concise and focused on language learning.
            Structure your response like this:
            [Spanish response]
            Translation: [English translation]`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${JSON.stringify(data)}`);
    }

    console.log('Received response from OpenAI:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    let content = data.choices[0].message.content;
    let translation = '';

    // Split content and translation if response contains both
    if (content.includes('Translation:')) {
      [content, translation] = content.split('Translation:');
      content = content.trim();
      translation = translation.trim();
    }

    return new Response(
      JSON.stringify({ content, translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-tutor function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get AI response', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
