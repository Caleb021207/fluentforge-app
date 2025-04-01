
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the updated Perplexity API key format
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY') || "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLanguage } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage);

    // Determine if user is learning English or Spanish based on their native language
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    
    // Return a fallback response in case API call fails
    const fallbackResponse = {
      content: isLearningEnglish 
        ? "I'm here to help you practice English. What would you like to talk about today?" 
        : "Estoy aquí para ayudarte a practicar español. ¿De qué te gustaría hablar hoy?",
      translation: isLearningEnglish 
        ? "Estoy aquí para ayudarte a practicar inglés. ¿De qué te gustaría hablar hoy?" 
        : "I'm here to help you practice Spanish. What would you like to talk about today?"
    };

    // Prepare Perplexity API call
    const systemPrompt = isLearningEnglish 
      ? "You are a tutor helping a Spanish or Portuguese speaker learn English. Respond in English with clear, helpful corrections and explanations. Include a translation of your response in their native language. Be conversational and engage with the topic they mention." 
      : "Eres un tutor ayudando a un hablante de inglés a aprender español. Responde en español con correcciones y explicaciones claras y útiles. Incluye una traducción de tu respuesta en inglés. Sé conversacional y responde al tema que mencionan.";
    
    console.log('Using system prompt:', systemPrompt);
    
    try {
      console.log(`Making API request to Perplexity with key: ${perplexityApiKey.substring(0, 10)}...`);
      
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error response:', errorText);
        console.error(`Response status: ${response.status}`);
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Perplexity API response:', responseData);
      
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

      console.log('Returning tutoring response with content:', content.substring(0, 50) + '...');
      return new Response(
        JSON.stringify({ content, translation }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Perplexity API call failed:', apiError);
      // Return fallback response if API call fails
      return new Response(
        JSON.stringify(fallbackResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
