
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the Perplexity API key
const perplexityApiKey = "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate a response for a conversation
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLanguage, conversationHistory, cefrLevel, audioResponse } = await req.json();
    console.log('Received message:', message, 'User language:', userLanguage, 'CEFR Level:', cefrLevel, 'Audio Response:', audioResponse);

    // Determine if user is learning English or Spanish based on their native language
    const isLearningEnglish = userLanguage === 'spanish' || userLanguage === 'portuguese';
    const targetLanguage = isLearningEnglish ? 'English' : 'Spanish';
    const nativeLanguage = isLearningEnglish ? (userLanguage === 'spanish' ? 'Spanish' : 'Portuguese') : 'English';
    
    // Prepare level-appropriate instruction
    let levelInstruction = '';
    switch (cefrLevel) {
      case 'A1':
        levelInstruction = `Use very simple vocabulary and basic sentences. Stick to present tense and very common expressions.`;
        break;
      case 'A2':
        levelInstruction = `Use simple vocabulary and basic sentences. Include some common past tense and future expressions.`;
        break;
      case 'B1':
        levelInstruction = `Use intermediate vocabulary with some complex sentences. Include various tenses and common idioms.`;
        break;
      case 'B2':
        levelInstruction = `Use rich vocabulary with complex sentences and various grammatical structures. Include idioms and colloquial expressions.`;
        break;
      default:
        levelInstruction = `Use intermediate vocabulary with some complex sentences. Include various tenses and common idioms.`;
    }

    // Build system prompt based on user language and CEFR level
    const systemPrompt = isLearningEnglish 
      ? `You are a language tutor helping a ${nativeLanguage} speaker practice ${targetLanguage}. ${levelInstruction} Always respond in English with clear, helpful explanations. Include a translation of your response in ${nativeLanguage}.` 
      : `Eres un tutor de idiomas ayudando a un hablante de ${nativeLanguage} a practicar ${targetLanguage}. ${levelInstruction} Siempre responde en español con explicaciones claras y útiles. Incluye una traducción de tu respuesta en ${nativeLanguage}.`;
    
    // Return a fallback response while diagnosing API issues
    const fallbackResponse = {
      reply: isLearningEnglish 
        ? "I'm here to help you practice English. What would you like to talk about today?" 
        : "Estoy aquí para ayudarte a practicar español. ¿De qué te gustaría hablar hoy?",
      translation: isLearningEnglish 
        ? "Estoy aquí para ayudarte a practicar inglés. ¿De qué te gustaría hablar hoy?" 
        : "I'm here to help you practice Spanish. What would you like to talk about today?"
    };

    try {
      // Create messages array starting with system prompt
      const messages = [
        {
          role: "system",
          content: systemPrompt
        }
      ];
      
      // Add conversation history if available
      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }
      
      // Add current message
      messages.push({
        role: "user",
        content: message
      });
      
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error response:', errorText);
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

      // Update conversation history for future requests
      const updatedHistory = [...(conversationHistory || [])];
      updatedHistory.push({ role: "user", content: message });
      updatedHistory.push({ 
        role: "assistant", 
        content: fullContent 
      });
      
      // Limit history to last 10 messages to prevent token limits
      if (updatedHistory.length > 10) {
        updatedHistory.splice(0, updatedHistory.length - 10);
      }

      console.log('Returning chat response');
      return new Response(
        JSON.stringify({ 
          content, 
          translation,
          updatedHistory
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Perplexity API call failed:', apiError);
      // Return fallback response if API call fails
      return new Response(
        JSON.stringify({
          content: fallbackResponse.reply,
          translation: fallbackResponse.translation,
          updatedHistory: conversationHistory || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
