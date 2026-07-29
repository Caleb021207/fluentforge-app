import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";


serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'premium-voice-realtime', 30);
  if (gate.error) return gate.error;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify user and check usage limits
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if user can start premium voice session
    const { data: canStart, error: checkError } = await supabase.rpc(
      'can_start_premium_voice_session',
      { target_student_id: user.id }
    );

    if (checkError || !canStart?.allowed) {
      return new Response(
        JSON.stringify({ error: 'Monthly limit reached', details: canStart }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body for proficiency info
    const requestBody = await req.json().catch(() => ({}));
    const { cefrLevel, userLanguage, targetLanguage } = requestBody;
    
    // CEFR-based behavior configuration
    const LEVEL_BEHAVIOR: Record<string, { nativeLanguageRatio: number; explanationStyle: string }> = {
      'A1': { nativeLanguageRatio: 0.6, explanationStyle: 'native_heavy' },
      'A2': { nativeLanguageRatio: 0.45, explanationStyle: 'native_heavy' },
      'B1': { nativeLanguageRatio: 0.25, explanationStyle: 'mixed' },
      'B2': { nativeLanguageRatio: 0.12, explanationStyle: 'target_heavy' },
      'C1': { nativeLanguageRatio: 0.05, explanationStyle: 'target_only' },
      'C2': { nativeLanguageRatio: 0.02, explanationStyle: 'target_only' }
    };
    
    const effectiveLevel = cefrLevel?.toUpperCase().split('/')[0].replace('+', '') || 'B1';
    const levelConfig = LEVEL_BEHAVIOR[effectiveLevel] || LEVEL_BEHAVIOR['B1'];
    const nativePercent = Math.round(levelConfig.nativeLanguageRatio * 100);
    const targetLang = targetLanguage || 'English';
    const nativeLang = userLanguage || 'their native language';
    
    // Build adaptive instructions based on proficiency
    let languageGuidance = '';
    if (levelConfig.explanationStyle === 'native_heavy') {
      languageGuidance = `Use ${nativeLang} for approximately ${nativePercent}% of your responses. Always provide translations for new vocabulary. Explain grammar in ${nativeLang}.`;
    } else if (levelConfig.explanationStyle === 'mixed') {
      languageGuidance = `Use ${targetLang} for most responses (~${100 - nativePercent}%). Provide ${nativeLang} support for complex explanations.`;
    } else if (levelConfig.explanationStyle === 'target_heavy') {
      languageGuidance = `Use ${targetLang} for ${100 - nativePercent}% of responses. Only use ${nativeLang} for critical clarifications.`;
    } else {
      languageGuidance = `Use ${targetLang} almost exclusively. Only use ${nativeLang} if absolutely critical for comprehension.`;
    }
    
    const adaptiveInstructions = `You are an encouraging ${targetLang} language tutor at CEFR ${effectiveLevel} level.

LANGUAGE SUPPORT:
${languageGuidance}

CORE PRINCIPLES:
- Speak primarily in ${targetLang} based on the language ratio above
- Keep conversations flowing naturally
- Use simple ${targetLang} explanations when students struggle
- Ask engaging questions to encourage ${targetLang} practice

WHEN TO USE NATIVE LANGUAGE:
Only use ${nativeLang} when:
1. The student explicitly asks for translation/clarification and seems genuinely confused
2. A critical grammar concept needs explanation and ${targetLang} explanations haven't worked
3. Safety or urgent clarification is needed

IMPORTANT: After any native language clarification:
- Keep it brief (1-2 sentences max)
- Immediately redirect back to ${targetLang}
- Resume the ${targetLang} conversation naturally

Your job is to maximize ${targetLang} practice time while being supportive when genuine confusion arises.`;

    console.log(`Premium voice session: CEFR=${effectiveLevel}, nativeRatio=${levelConfig.nativeLanguageRatio}`);

    // Get ephemeral token from OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-realtime-2025-08-28",
        voice: "sage",
        instructions: adaptiveInstructions,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Ephemeral token created for user:", user.id);

    // Generate session ID for tracking
    const sessionId = crypto.randomUUID();
    const sessionStart = Date.now();

    // Return token to client with session tracking info
    return new Response(JSON.stringify({
      ...data,
      user_id: user.id,
      session_id: sessionId,
      session_start: sessionStart
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
