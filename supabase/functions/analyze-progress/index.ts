import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";


serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'analyze-progress', 50);
  if (gate.error) return gate.error;

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { attempts } = await req.json();
    const summary = processAttempts(attempts);

    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a language learning expert. Analyze student performance and provide recommendations. Return valid JSON.' },
          { role: 'user', content: `Performance data: ${JSON.stringify(summary)}. Analyze progress and provide recommendations for each skill. Format as JSON.` }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI gateway error: ${response.status}`);

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const recommendations = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processAttempts(attempts: any[]) {
  const skillStats: Record<string, { scores: number[]; dates: string[] }> = {
    reading: { scores: [], dates: [] }, writing: { scores: [], dates: [] },
    speaking: { scores: [], dates: [] }, listening: { scores: [], dates: [] },
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
