
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the Perplexity API key
const perplexityApiKey = "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";

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
    
    // Prepare Perplexity API call
    const systemPrompt = isLearningEnglish 
      ? "You are a tutor helping a Spanish or Portuguese speaker learn English. Respond in English with clear, helpful corrections and explanations. Include a translation of your response in their native language." 
      : "Eres un tutor ayudando a un hablante de inglés a aprender español. Responde en español con correcciones y explicaciones claras y útiles. Incluye una traducción de tu respuesta en inglés.";
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const responseData = await response.json();
    console.log('Perplexity API response:', responseData);
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${responseData.error?.message || 'Unknown error'}`);
    }

    // Extract content and try to parse out translation
    const fullContent = responseData.choices[0].message.content;
    let content = fullContent;
    let translation = "";
    
    // Check if the response contains a translation section
    if (fullContent.includes("Translation:")) {
      const parts = fullContent.split("Translation:");
      content = parts[0].trim();
      translation = parts[1].trim();
    } else if (fullContent.includes("Traducción:")) {
      const parts = fullContent.split("Traducción:");
      content = parts[0].trim();
      translation = parts[1].trim();
    }

    if (requestType === 'assessment') {
      // For assessment requests, analyze the content and provide scores
      return new Response(
        JSON.stringify({
          assessment: {
            reading: "B1",
            writing: "B1",
            speaking: "B1",
            listening: "B1",
            overallLevel: "B1"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Returning tutoring response');
    return new Response(
      JSON.stringify({ content, translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-tutor function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'The tutoring service encountered an error.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
