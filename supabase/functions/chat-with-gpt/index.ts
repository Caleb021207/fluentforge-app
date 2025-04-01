
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Remove hardcoded API key
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
    const { message, userLanguage, conversationHistory = [], cefrLevel = 'B1' } = await req.json();
    
    // Determine which language the system should respond in
    const responseLanguage = userLanguage === 'english' ? 'Spanish' : 'English';
    const nativeLanguage = userLanguage === 'english' ? 'English' : userLanguage === 'spanish' ? 'Spanish' : 'Portuguese';

    // Instead of making an API call, return a message that the service is being updated
    const serviceUpdateMessage = {
      content: responseLanguage === 'Spanish' 
        ? "Estamos actualizando nuestro servicio de chat en este momento. Por favor, vuelve más tarde." 
        : "We are currently updating our chat service. Please check back later.",
      translation: responseLanguage === 'Spanish'
        ? "We are currently updating our chat service. Please check back later."
        : "Estamos actualizando nuestro servicio de chat en este momento. Por favor, vuelve más tarde.",
      updatedHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { 
          role: 'assistant', 
          content: `${responseLanguage === 'Spanish' 
            ? "Estamos actualizando nuestro servicio de chat en este momento. Por favor, vuelve más tarde." 
            : "We are currently updating our chat service. Please check back later."}\n\nTranslation: ${
              responseLanguage === 'Spanish'
                ? "We are currently updating our chat service. Please check back later."
                : "Estamos actualizando nuestro servicio de chat en este momento. Por favor, vuelve más tarde."
            }`
        }
      ]
    };

    console.log('Returning service update message instead of OpenAI response');
    return new Response(
      JSON.stringify(serviceUpdateMessage),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'The chat service is currently unavailable.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
