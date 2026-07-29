import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Resolve the language the learner is actually studying (never hardcoded). */
async function resolveTargetLanguage(userId: string, requested?: unknown): Promise<string> {
  if (typeof requested === "string" && requested.trim()) {
    return requested.trim().slice(0, 40);
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data } = await supabase
      .from("profiles")
      .select("target_language")
      .eq("id", userId)
      .maybeSingle();
    if (data?.target_language) return String(data.target_language).slice(0, 40);
  } catch (e) {
    console.error("resolveTargetLanguage failed:", e);
  }
  return "the target language";
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'grade-writing', 50);
  if (gate.error) return gate.error;

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { essay, prompt, targetLevel, targetLanguage } = await req.json();
    const language = await resolveTargetLanguage(gate.userId!, targetLanguage);

    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} language examiner following the CEFR framework. Evaluate the ${language} writing submission${targetLevel ? ` against the ${targetLevel} level` : ''}. Score ranges: 84-100% C2, 67-83% C1, 50-66% B2, 33-49% B1, 17-32% A2, 0-16% A1. Return JSON: { "score": number, "feedback": "detailed feedback string" }`
          },
          { role: 'user', content: `Writing Prompt: ${prompt}\n\nStudent's Response:\n${essay}` }
        ],
      }),
    });


    if (!response.ok) throw new Error(`AI gateway error: ${response.status}`);

    const data = await response.json();
    const content = data.choices[0].message.content;
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = { score: 60, feedback: content };
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
