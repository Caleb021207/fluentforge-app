
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetLanguage, level } = await req.json();
    
    if (!targetLanguage || !level) {
      return new Response(
        JSON.stringify({ error: "Target language and level are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map complexity levels to appropriate instructions
    const levelInstructions = {
      "Novice": "basic expressions with simple vocabulary that a beginner would learn",
      "Intermediate": "everyday phrases with moderate vocabulary that an intermediate learner should practice",
      "Advanced": "complex sentences with more sophisticated vocabulary that an advanced learner would use",
      "Superior": "academically or professionally oriented content with specialized vocabulary"
    };

    const instruction = levelInstructions[level] || levelInstructions.Intermediate;
    
    // Generate phrase using OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a language learning assistant that generates pronunciation practice phrases.`
          },
          {
            role: "user",
            content: `Generate ONE ${targetLanguage} phrase (${instruction}). Reply with a JSON object having these properties:
            1. phrase: The ${targetLanguage} phrase to practice
            2. translation: The English translation
            3. topic: A short category/topic label
            4. level: "${level}"
            
            ONLY respond with the JSON. No explanations or additional text.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Unexpected OpenAI response:", data);
      return new Response(
        JSON.stringify({ error: "Failed to generate phrase" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the content which should be JSON
    try {
      const content = data.choices[0].message.content;
      // Handle potential non-JSON formatted responses by trying to extract JSON
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const phraseData = JSON.parse(jsonStr);

      return new Response(
        JSON.stringify(phraseData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError, data.choices[0].message.content);
      return new Response(
        JSON.stringify({ error: "Failed to parse phrase data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in generate-pronunciation-phrase function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
