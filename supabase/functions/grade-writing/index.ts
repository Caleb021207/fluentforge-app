
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
    const { essay, prompt, targetLevel } = await req.json();

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
            content: `You are an expert Spanish language examiner following the CEFR framework. 
            Evaluate the following Spanish writing submission based on these specific criteria:

            1. Language accuracy (grammar, spelling, punctuation)
            2. Vocabulary range and appropriateness
            3. Text organization and coherence
            4. Task completion and content relevance
            5. Overall CEFR level demonstrated

            Score ranges and corresponding CEFR levels:
            - 90-100%: C2 (Near-native mastery)
            - 80-89%: C1 (Advanced)
            - 70-79%: B2 (Upper Intermediate)
            - 60-69%: B1 (Intermediate)
            - 50-59%: A2 (Elementary)
            - Below 50%: A1 (Beginner)

            Return your evaluation as a JSON object with:
            {
              "score": (numerical score 0-100),
              "level": (CEFR level based on score ranges above),
              "feedback": (detailed feedback in English explaining the score and areas for improvement)
            }`
          },
          { 
            role: 'user', 
            content: `Writing Prompt: ${prompt}\n\nStudent's Response:\n${essay}` 
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);

    let result;
    try {
      // Try to parse the AI's response as JSON
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If JSON parsing fails, extract information from the text response
      const content = data.choices[0].message.content;
      console.log('Failed to parse AI response as JSON:', content);
      
      // Default to conservative scoring if parsing fails
      result = {
        score: 60,
        level: 'B1',
        feedback: content
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in grade-writing function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
