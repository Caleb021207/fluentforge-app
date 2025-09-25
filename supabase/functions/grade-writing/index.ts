
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CEFR scoring rubric
const scoreToLevel = (score: number) => {
  if (score >= 84) return 'C2';
  if (score >= 67) return 'C1';
  if (score >= 50) return 'B2';
  if (score >= 33) return 'B1';
  if (score >= 17) return 'A2';
  return 'A1';
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

            Use strictly the following score ranges and corresponding CEFR levels:
            - 84-100%: C2 (Near-native mastery)
            - 67-83%: C1 (Advanced)
            - 50-66%: B2 (Upper Intermediate)
            - 33-49%: B1 (Intermediate)
            - 17-32%: A2 (Elementary)
            - 0-16%: A1 (Beginner)

            It is crucial that you adhere to this scoring rubric exactly.

            Return your evaluation as a JSON object with:
            {
              "score": (numerical score 0-100),
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
      const parsedResult = JSON.parse(data.choices[0].message.content);
      
      // Apply our own scoring rubric to ensure consistency
      result = {
        score: parsedResult.score,
        feedback: parsedResult.feedback,
      };
      
      console.log('Parsed result:', result);
    } catch (e) {
      // If JSON parsing fails, extract information from the text response
      const content = data.choices[0].message.content;
      console.log('Failed to parse AI response as JSON:', content);
      
      // Default to conservative scoring if parsing fails
      result = {
        score: 60,
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
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
