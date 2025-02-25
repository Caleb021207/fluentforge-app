
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
            content: `You are an expert Spanish language examiner for CEFR certifications. Evaluate the following response based on the target level ${targetLevel}. Provide:
            1. A numerical score (0-100)
            2. The appropriate CEFR level (A1-C2)
            3. Detailed feedback on grammar, vocabulary, and structure
            
            Use these score ranges for levels:
            - C2: 90-100%
            - C1: 80-89%
            - B2: 70-79%
            - B1: 60-69%
            - A2: 50-59%
            - A1: 40-49%
            
            Return your evaluation as a JSON object with score, level, and feedback fields.`
          },
          { 
            role: 'user', 
            content: `Writing Prompt: ${prompt}\n\nStudent's Response: ${essay}` 
          }
        ],
      }),
    });

    const data = await response.json();
    let result;
    
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If JSON parsing fails, create a structured response from the text
      const text = data.choices[0].message.content;
      result = {
        score: 70,
        level: targetLevel,
        feedback: text,
      };
    }

    // Log the evaluation result
    console.log('Writing evaluation result:', result);

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
