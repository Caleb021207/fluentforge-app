import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";


serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'generate-study-recommendations', 50);
  if (gate.error) return gate.error;

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { transcriptId } = await req.json();
    if (!transcriptId) return new Response(JSON.stringify({ error: 'Transcript ID is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: analysis, error: analysisError } = await supabase.from('transcript_analyses').select('*').eq('id', transcriptId).single();
    if (analysisError || !analysis) return new Response(JSON.stringify({ error: 'Transcript analysis not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: existingRecs } = await supabase.from('study_recommendations').select('id').eq('transcript_id', transcriptId);
    if (existingRecs?.length) return new Response(JSON.stringify({ message: 'Recommendations already exist' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const prompt = `Based on this assessment (Score: ${analysis.overall_score}/10, CEFR: ${analysis.cefr_level}), generate 3-5 study recommendations. Return a JSON array of objects with: skill_area, priority_level (1-5), recommendation_text, estimated_time_investment, difficulty_level, resources. Only reference internal platform features (/practice, /voice-chat, /lessons, /vocabulary, /certificates).`;

    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a language learning expert. Return valid JSON arrays only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`AI gateway error: ${response.status}`);

    const aiData = await response.json();
    let content = aiData.choices[0].message.content;
    if (content.startsWith('```')) content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const recommendations = JSON.parse(content);

    const { data: insertedRecs, error: insertError } = await supabase
      .from('study_recommendations')
      .insert(recommendations.map((rec: any) => ({
        user_id: analysis.user_id,
        transcript_id: transcriptId,
        recommendation_type: rec.skill_area,
        priority: rec.priority_level,
        title: rec.recommendation_text?.substring(0, 100),
        description: rec.recommendation_text,
      })))
      .select();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'Recommendations generated', recommendations: insertedRecs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
