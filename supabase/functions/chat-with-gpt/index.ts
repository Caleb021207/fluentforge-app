
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the Perplexity API key
const perplexityApiKey = "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";

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

    // Format conversation history for the API
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Create system message based on user's language and CEFR level
    const systemMessage = {
      role: "system",
      content: `You are a language learning assistant helping a ${nativeLanguage} speaker practice ${responseLanguage}. 
      Respond in ${responseLanguage} at ${cefrLevel} level. Keep sentences simple and use common vocabulary.
      Always include a translation of your response into ${nativeLanguage} at the end of your message prefixed with "Translation:" or "Traducción:".`
    };

    // Combine system message, history, and new user message
    const messages = [
      systemMessage,
      ...formattedHistory,
      { role: "user", content: message }
    ];

    console.log('Sending request to Perplexity API');
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: "sonar-medium-online",
        messages: messages
      })
    });

    const responseData = await response.json();
    console.log('Perplexity API response:', responseData);
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${responseData.error?.message || 'Unknown error'}`);
    }

    // Extract content and translation
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

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: `${content}\n\nTranslation: ${translation}` }
    ];

    console.log('Returning chat response with translation');
    return new Response(
      JSON.stringify({
        content,
        translation,
        updatedHistory
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'The chat service encountered an error.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
