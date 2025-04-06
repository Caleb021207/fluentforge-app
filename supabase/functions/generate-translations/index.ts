
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { sourceLanguage, targetLanguage, translations } = await req.json();

    if (!sourceLanguage || !targetLanguage || !translations || Object.keys(translations).length === 0) {
      throw new Error("Missing required parameters: sourceLanguage, targetLanguage, and translations");
    }

    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}. ${Object.keys(translations).length} items to translate`);

    // Prepare the prompt for translation
    const translationPrompt = `
    You are a professional translator who specializes in translating web application interface text.
    Translate the following key-value pairs from ${sourceLanguage} to ${targetLanguage}. 
    Maintain all placeholders like {{placeholder}} and do not translate them.
    Also don't translate proper names or technical terms that should remain in the original language.
    Return ONLY a valid JSON object with the same keys but translated values. Nothing else.
    
    Here are the key-value pairs to translate:
    ${JSON.stringify(translations, null, 2)}
    `;

    // Call OpenAI API for translation
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
            content: 'You are a professional translator who specializes in accurate UI text translation. Your responses should contain ONLY the requested JSON with no additional text.'
          },
          { role: 'user', content: translationPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No translation result received from AI");
    }

    const translatedContent = data.choices[0].message.content;
    
    // Try to parse the response as JSON
    let translatedJson;
    try {
      // Extract JSON if surrounded by markdown code blocks
      const jsonMatch = translatedContent.match(/```json\n([\s\S]*)\n```/) || 
                        translatedContent.match(/```\n([\s\S]*)\n```/);
      
      const jsonString = jsonMatch ? jsonMatch[1] : translatedContent;
      translatedJson = JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse translation result as JSON:", error);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      translations: translatedJson,
      sourceLanguage,
      targetLanguage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating translations:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
