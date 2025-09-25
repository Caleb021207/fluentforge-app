
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { attempts } = await req.json();

    // Process attempts data to create a summary for the AI
    const summary = processAttempts(attempts);

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
            content: `You are a language learning expert who analyzes student performance and provides specific, actionable recommendations. 
            Focus on identifying patterns in their test scores and suggesting concrete ways to improve.`
          },
          {
            role: 'user',
            content: `Here is the student's performance data: ${JSON.stringify(summary)}. 
            Please analyze their progress and provide specific recommendations for each skill (reading, writing, speaking, listening).
            For each skill, provide:
            1. Current level assessment
            2. 2-3 specific strengths
            3. 2-3 specific areas for improvement
            4. 3 actionable recommendations for improvement
            Format the response as JSON.`
          }
        ],
      }),
    });

    const aiData = await response.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-progress function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processAttempts(attempts: any[]) {
  const skillStats: { [key: string]: { scores: number[], dates: string[] } } = {
    reading: { scores: [], dates: [] },
    writing: { scores: [], dates: [] },
    speaking: { scores: [], dates: [] },
    listening: { scores: [], dates: [] },
  };

  attempts.forEach(attempt => {
    const skill = attempt.certification_type;
    if (skillStats[skill]) {
      skillStats[skill].scores.push(attempt.score);
      skillStats[skill].dates.push(attempt.completed_at);
    }
  });

  return skillStats;
}
