
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const systemPrompt = `You are an expert Spanish language examiner for CEFR certifications. 
Evaluate the following essay response based on the given prompt. 
Provide a score (0-100), determine if the level matches the target level ${targetLevel}, 
and give constructive feedback focusing on:
1. Grammar and syntax
2. Vocabulary usage
3. Overall coherence and structure
4. Areas for improvement

Format your response as JSON with score, level, and feedback fields.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Prompt: ${prompt}\n\nEssay: ${essay}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get assessment from AI');
    }

    const data = await response.json();
    let result;
    
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If JSON parsing fails, create a structured response from the text
      const text = data.choices[0].message.content;
      result = {
        score: 70, // Default score
        level: targetLevel,
        feedback: text,
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
