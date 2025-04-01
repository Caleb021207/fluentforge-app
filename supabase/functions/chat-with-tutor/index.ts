
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Remove hardcoded API key
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
    const { message, requestType, userLanguage } = await req.json();
    console.log('Received message:', message, 'Request type:', requestType, 'User language:', userLanguage);

    // Determine if user is learning English or Spanish based on their native language
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    
    // Instead of making an API call, return a message that the service is being updated
    let content = isLearningEnglish 
      ? "We are currently updating our tutoring service. Please check back later." 
      : "Estamos actualizando nuestro servicio de tutoría en este momento. Por favor, vuelve más tarde.";
    
    let translation = isLearningEnglish 
      ? "Estamos actualizando nuestro servicio de tutoría en este momento. Por favor, vuelve más tarde." 
      : "We are currently updating our tutoring service. Please check back later.";

    if (requestType === 'assessment') {
      return new Response(
        JSON.stringify({
          assessment: {
            reading: "Service temporarily unavailable",
            writing: "Service temporarily unavailable",
            speaking: "Service temporarily unavailable",
            listening: "Service temporarily unavailable",
            overallLevel: "N/A"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Returning service update message instead of OpenAI response');
    return new Response(
      JSON.stringify({ content, translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-tutor function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'The tutoring service is currently unavailable.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
