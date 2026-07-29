import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'analyze-transcript', 20);
  if (gate.error) return gate.error;

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });

    const { imageData, fileName, fileType } = await req.json();

    if (!ALLOWED_MIME_TYPES.includes(fileType?.toLowerCase())) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid file type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!imageData?.startsWith('data:image/') || imageData.length * 0.75 > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or oversized image' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Analyzing transcript image for user: ${user.id}`);

    const prompt = `Analyze this language learning test transcript/score report. Extract: overall score (0-100), CEFR level, section scores, strengths, weaknesses, and 3-5 recommendations referencing platform features (/practice, /voice-chat, /pronunciation-practice, /lessons, /vocabulary). Return JSON: { "overall_score": number, "cefr_level": string, "reading_listening_score": number|null, "written_production_score": number|null, "spoken_fluency_score": number|null, "test_date": string|null, "test_provider": string|null, "strengths": string[], "weaknesses": string[], "recommendations": string[], "detailed_feedback": string, "progress_insights": string }`;

    // Use Gemini Pro for vision capability
    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI gateway error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const analysisContent = data.choices[0]?.message?.content;
    if (!analysisContent) throw new Error('No analysis content received');

    let parsedAnalysis;
    try {
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      parsedAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisContent);
    } catch {
      parsedAnalysis = {
        overall_score: null, cefr_level: 'Unknown',
        strengths: ['Analysis completed'], weaknesses: ['Could not extract detailed metrics'],
        recommendations: ['Please try uploading a clearer image'],
        detailed_feedback: analysisContent, progress_insights: 'Detailed extraction failed.'
      };
    }

    if (Array.isArray(parsedAnalysis.recommendations)) {
      parsedAnalysis.recommendations = parsedAnalysis.recommendations.slice(0, 10).map((r: any) => typeof r === 'string' ? r.slice(0, 500) : String(r.recommendation_text || r).slice(0, 500));
    }

    return new Response(JSON.stringify({ success: true, analysis: parsedAnalysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
