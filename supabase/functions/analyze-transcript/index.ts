import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";
import { parseModelAnalysis, validateUploadDataUrl } from "../_shared/assessmentParsing.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";


const MAX_FILE_SIZE = 5 * 1024 * 1024;

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  // P7 guardrails preserved (plan 12 §1 C7.1): JWT + fail-closed 20/user/day
  // quota. Moving quota after input validation is 12 §2.6, a later workstream.
  const gate = await guardPaidRequest(req, corsHeaders, 'analyze-transcript', 20);
  if (gate.error) return gate.error;

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });

    const { imageData } = await req.json();

    // F1.1 subset (plan 12 §2.1): validate the data URL by its own declared
    // mime — accepts the images the client offers AND application/pdf, which
    // the old images-only allow-list rejected (every PDF 400'd after its
    // bytes had already landed in storage). The client-declared `fileType`
    // field is advisory only and no longer consulted.
    const upload = validateUploadDataUrl(imageData);
    if (!upload.ok) {
      return new Response(JSON.stringify({ success: false, error: upload.error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (imageData.length * 0.75 > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ success: false, error: 'File too large for analysis (5MB limit)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Analyzing transcript ${upload.kind} (${upload.mime}) for user: ${user.id}`);

    const prompt = `Analyze this language learning test transcript/score report. Extract: overall score (0-100), CEFR level, section scores, strengths, weaknesses, and 3-5 recommendations referencing platform features (/practice, /voice-chat, /pronunciation-practice, /lessons, /vocabulary). Return JSON: { "overall_score": number, "cefr_level": string, "reading_listening_score": number|null, "written_production_score": number|null, "spoken_fluency_score": number|null, "test_date": string|null, "test_provider": string|null, "strengths": string[], "weaknesses": string[], "recommendations": string[], "detailed_feedback": string, "progress_insights": string }`;

    // Use Gemini Pro for vision capability. The document travels as a data
    // URL content part [observed gateway request shape]; for PDFs the data
    // URL carries mime application/pdf, which the gateway decodes into a
    // Gemini inline_data part with that mime — Gemini natively accepts PDF
    // documents this way [documented: ai.google.dev/gemini-api/docs/
    // document-processing]. Gateway PDF pass-through itself is [requires
    // validation] per plan 12 §2.1 F1.2 (staging spike before relying on it).
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

    // F5 quarantine (plan 12 §2.5): schema-validate the model output. A parse
    // or validation failure NEVER persists a stub row (the old code saved
    // cefr_level:'Unknown' stubs as real analyses). transcript_analyses has
    // no status column yet (types.ts transcript_analyses Row [observed]), so
    // the honest path is no-insert + explicit failure; the full
    // uploaded→failed lifecycle lands with 12 §2.4.
    const parsed = parseModelAnalysis(analysisContent);
    if (!parsed.ok) {
      console.error('Model output quarantined (not persisted):', parsed.error);
      return new Response(
        JSON.stringify({ success: false, error: `We couldn't read this document: ${parsed.error}. Please try a clearer copy.` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const analysis = parsed.analysis;

    // Persist server-side: transcript_analyses holds a proficiency level/score,
    // so it is not client-writable. Append-only history preserved (P5);
    // scores arrive already clamped 0-100 by parseModelAnalysis (P2/C2.1).
    const { error: saveError } = await supabase.from('transcript_analyses').insert({
      user_id: user.id,
      cefr_level: analysis.cefr_level,
      overall_score: analysis.overall_score,
      analysis_data: analysis,
    });
    if (saveError) {
      // Silent-loss fix (plan 12 §2.4 acceptance): a failed insert must never
      // report success — the learner would see results that were never saved.
      console.error('Failed to persist transcript analysis:', saveError);
      return new Response(
        JSON.stringify({ success: false, error: 'Analysis completed but the result could not be saved. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ success: true, analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
