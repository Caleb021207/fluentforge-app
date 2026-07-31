
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { filterProhibitedContent } from "./config.ts";
import { generateHints } from "./hints.ts";
import { getLanguageDisplayName, determineLanguagePair, getUserNativeLanguage } from "./languageUtils.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { guardPaidRequest } from "../_shared/authGuard.ts";
import { getCurriculumSnapshot, renderCurriculumBlock } from "../_shared/curriculumContext.ts";
import { getConversationScenario } from "../_shared/conversationScenarios.ts";
import { chatJson } from "../_shared/aiGateway.ts";
import {
  buildSafetyPolicyBlock,
  crisisResourceMessage,
  resolveSafetyContext,
  shouldEscalate,
} from "../_shared/safetyContext.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
if (!LOVABLE_API_KEY) console.error("LOVABLE_API_KEY is not configured");
const MODEL = "google/gemini-2.5-flash";
const FALLBACK_MODEL = "google/gemini-2.5-flash-lite";

async function callLovableAI(
  messages: {role: string; content: string}[], 
  model: string = MODEL, 
  maxTokens: number = 800
): Promise<{content: string; tokensUsed: number}> {
  const resp = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Lovable AI error ${resp.status}: ${text}`);
  }
  
  const data = await resp.json();
  return {
    content: data.choices[0].message.content || "",
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

function logDataAccess(userId: string, dataType: string, purpose: string) {
  const timestamp = new Date().toISOString();
  console.log(`FERPA Access Log: User ${userId} accessed ${dataType} for ${purpose} at ${timestamp}`);
}

function validateLanguage(lang: string | undefined): string {
  if (!lang) return "english";
  const normalizedLang = lang.toLowerCase();
  const supportedLanguages = [
    "english", "spanish", "portuguese", "french", "japanese", 
    "korean", "mandarin", "cantonese", "russian", "arabic", 
    "hindi", "vietnamese", "ukrainian", "indonesian", "farsi", 
    "urdu", "pashto", "swahili", "bengali", "somali", 
    "yoruba", "amharic", "haitian", "malayalam", "igbo", 
    "polish", "turkish", "romanian", "tagalog", "german",
    "italian", "thai", "gujarati", "punjabi", "nepali"
  ];
  return supportedLanguages.includes(normalizedLang) ? normalizedLang : "english";
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gate = await guardPaidRequest(req, corsHeaders, 'chat-with-tutor', 300);
  if (gate.error) return gate.error;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);

    // SafetyContext (plan 15 §3.1): resolve fail-closed from the VERIFIED
    // user id — never from client-supplied ids. A missing row or failed read
    // yields null → strict.
    const safetyAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    const { data: safetyProfile } = await safetyAdmin
      .from('profiles')
      .select('is_minor, safety_mode, age_verified_at')
      .eq('id', user.id)
      .maybeSingle();
    const safetyCtx = resolveSafetyContext(safetyProfile ?? null);
    // Injected server-side ahead of every system prompt so the client cannot
    // strip it (plan 15 §3.2).
    const safetyBlock = buildSafetyPolicyBlock(safetyCtx);

    const requestData = await req.json();
    const { 
      message, 
      requestType, 
      userLanguage: rawUserLanguage, 
      targetLanguage: rawTargetLanguage, 
      conversationHistory = [],
      conversationLevel = "intermediate",
      cefrLevel = null,
      correctGrammar = false,
      assignmentTopic = "",
      isOpeningMessage = false,
      scenario_id = null,
      mode = null
    } = requestData;

    // Scenario role-play: validate against the server registry. Unknown or
    // missing ids simply fall back to plain tutor mode — never an error.
    const scenario = getConversationScenario(scenario_id);

    // ---- DEBRIEF MODE ----------------------------------------------------
    // The learner ended a scenario conversation; return structured feedback
    // as strict JSON: { corrections, strength, goal_met }. This path must
    // never surface a 500 with raw model text — any model/parse failure
    // degrades to a safe minimal object.
    if (mode === "debrief") {
      const rawTranscript = Array.isArray(requestData.messages) ? requestData.messages : [];
      const transcript = rawTranscript
        .filter((m: { role?: unknown; content?: unknown }) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
        .slice(-40);

      if (transcript.length === 0) {
        return new Response(
          JSON.stringify({ error: "No conversation to review yet." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const debriefTargetLang = getLanguageDisplayName(validateLanguage(rawTargetLanguage));
      const transcriptText = transcript
        .map((m: { role: string; content: string }) =>
          `${m.role === "user" ? "Learner" : "Partner"}: ${m.content.slice(0, 600)}`)
        .join("\n");

      const debriefSystem = `You are a kind, precise language coach reviewing a learner's short practice conversation in ${debriefTargetLang}.
Only correct the LEARNER's messages, never the Partner's.
Return STRICT JSON with exactly this shape:
{"corrections": [{"you_said": "...", "better": "...", "why": "..."}], "strength": "...", "goal_met": true}
Rules:
- corrections: at most 3, the most useful mistakes only. "you_said" is the learner's exact sentence. "better" is the corrected sentence in ${debriefTargetLang}. "why" is ONE short line in very simple English (A1-friendly). Empty array if the learner made no real mistakes.
- strength: one genuine, specific thing the learner did well (simple English, one sentence).
- goal_met: ${scenario ? `true if the learner achieved this goal, else false: "${scenario.goal}"` : "null (there was no set goal)"}.`;

      // Safe minimal fallback — used whenever the model call or parse fails.
      let feedback: {
        corrections: { you_said: string; better: string; why: string }[];
        strength: string;
        goal_met: boolean | null;
      } = {
        corrections: [],
        strength: "You kept the conversation going. Good practice.",
        goal_met: null,
      };

      try {
        const parsed = await chatJson<{
          corrections?: { you_said?: unknown; better?: unknown; why?: unknown }[];
          strength?: unknown;
          goal_met?: unknown;
        }>({
          model: MODEL,
          system: debriefSystem,
          prompt: `Conversation transcript:\n${transcriptText}`,
          maxTokens: 600,
        });

        if (parsed) {
          const corrections = (Array.isArray(parsed.corrections) ? parsed.corrections : [])
            .slice(0, 3)
            .map((c) => ({
              you_said: typeof c?.you_said === "string" ? c.you_said.slice(0, 300) : "",
              better: typeof c?.better === "string" ? c.better.slice(0, 300) : "",
              why: typeof c?.why === "string" ? c.why.slice(0, 200) : "",
            }))
            .filter((c) => c.you_said && c.better);
          feedback = {
            corrections,
            strength: typeof parsed.strength === "string" && parsed.strength.trim()
              ? parsed.strength.slice(0, 300)
              : feedback.strength,
            goal_met: typeof parsed.goal_met === "boolean" ? parsed.goal_met : null,
          };
        } else {
          console.error("Debrief JSON parse failed; returning safe minimal feedback");
        }
      } catch (debriefError) {
        console.error("Debrief model call failed; returning safe minimal feedback:", debriefError);
      }

      // Tolerant persistence: the hosted DB may not have conversation_sessions
      // yet (deploy/safe_update_3.sql). Never fail the response over storage.
      try {
        const learnerMessageCount = transcript.filter((m: { role: string }) => m.role === "user").length;
        const { error: insertError } = await safetyAdmin
          .from("conversation_sessions")
          .insert({
            user_id: user.id,
            scenario_id: scenario ? scenario.id : null,
            message_count: learnerMessageCount,
            feedback,
          });
        if (insertError) {
          if (/column|schema cache|does not exist/i.test(insertError.message ?? "")) {
            console.log("conversation_sessions not deployed yet; skipping persistence");
          } else {
            console.error("Failed to store conversation session:", insertError);
          }
        }
      } catch (persistError) {
        console.error("Error storing conversation session:", persistError);
      }

      return new Response(
        JSON.stringify(feedback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation
    let trimmedMessage = "";
    
    if (requestType !== 'hint' && requestType !== 'opening_message') {
      if (!message || typeof message !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message format' }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      trimmedMessage = message.trim();
      if (trimmedMessage.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Message cannot be empty' }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const MAX_MESSAGE_LENGTH = 2000;
      if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!Array.isArray(conversationHistory)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conversation history format' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check text practice limits
    let usingFallbackModel = false;
    if (requestType !== 'hint') {
      try {
        const { data: limitCheck, error: limitError } = await supabaseClient.rpc(
          'can_send_text_message',
          { p_student_id: user.id }
        );

        if (limitError) {
          console.error('Error checking text practice limits:', limitError);
        } else if (limitCheck && limitCheck.length > 0 && !limitCheck[0].can_send) {
          console.log('User has reached text practice limit, switching to fallback model');
          usingFallbackModel = true;
        }
      } catch (limitCheckError) {
        console.error('Failed to check usage limits:', limitCheckError);
      }
    }

    const MAX_HISTORY_LENGTH = 20;
    const limitedHistory = conversationHistory.length > MAX_HISTORY_LENGTH
      ? conversationHistory.slice(-MAX_HISTORY_LENGTH)
      : conversationHistory;

    for (const item of limitedHistory) {
      if (!item.role || !item.content || typeof item.content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid conversation history format' }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Prompt injection detection
    const suspiciousPatterns = [
      /ignore (all |previous )?instructions/i,
      /system prompt/i,
      /repeat (your|the) instructions/i,
      /<script/i,
      /javascript:/i
    ];
    if (suspiciousPatterns.some(pattern => pattern.test(trimmedMessage))) {
      console.warn(`Potential prompt injection detected from user ${user.id}`);
    }

    const userLanguage = validateLanguage(rawUserLanguage);
    let targetLanguage = validateLanguage(rawTargetLanguage);
    
    if (userLanguage === targetLanguage && userLanguage !== 'english') {
      targetLanguage = 'english';
    } else if (userLanguage === targetLanguage) {
      targetLanguage = 'spanish';
    }
    
    console.log(`Languages: user=${userLanguage}, target=${targetLanguage}`);
    logDataAccess(user.id, "language_practice", "language_learning");

    // Handle hint requests
    if (requestType === 'hint') {
      try {
        const hintCefrLevel = cefrLevel || 
          (conversationLevel === 'basic' ? 'A1' : conversationLevel === 'advanced' ? 'C1' : 'B1');
        
        const suggestions = await generateHints(
          limitedHistory, targetLanguage, userLanguage, hintCefrLevel, assignmentTopic || ""
        );
        
        return new Response(
          JSON.stringify({ suggestions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (hintError) {
        console.error("Error generating hints:", hintError);
        return new Response(
          JSON.stringify({ 
            suggestions: [
              { title: "Greetings", suggestions: ["Hola", "Buenos días", "¿Cómo estás?"] },
              { title: "Questions", suggestions: ["¿Qué haces?", "¿De dónde eres?"] }
            ] 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle translation requests
    if (requestType === 'translation') {
      const { content } = await callLovableAI([
        { role: "system", content: `You are a highly accurate translator. Translate the following text from ${targetLanguage} to ${userLanguage}. Only provide the translation, nothing else.` },
        { role: "user", content: message },
      ], MODEL, 500);
      
      return new Response(
        JSON.stringify({ translation: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userLangDisplay = getLanguageDisplayName(userLanguage);
    const targetLangDisplay = getLanguageDisplayName(targetLanguage);

    // Handle opening message requests
    if (requestType === 'opening_message') {
      const conversationToLevelMap: Record<string, string> = { 'basic': 'A1', 'intermediate': 'B1', 'advanced': 'C1' };
      const effectiveCefrLevel = cefrLevel 
        ? cefrLevel.toUpperCase().split('/')[0].replace('+', '') 
        : conversationToLevelMap[conversationLevel] || 'B1';
      
      const isBeginnerLevel = ['A1', 'A2'].includes(effectiveCefrLevel);
      
      const openingPrompt = `${safetyBlock}

You are a friendly ${targetLangDisplay} language tutor starting a conversation at CEFR ${effectiveCefrLevel} level.

ASSIGNMENT TOPIC: "${assignmentTopic}"

Generate a friendly opening message that:
1. Greets the student warmly in ${targetLangDisplay}
2. Introduces the topic
3. Asks an opening question
4. Uses vocabulary appropriate for ${effectiveCefrLevel} level

${isBeginnerLevel ? `Since ${effectiveCefrLevel} level: Use very simple, short sentences. Include ${userLangDisplay} translations in parentheses.` : `Since ${effectiveCefrLevel} level: Use natural ${targetLangDisplay}. No inline translations.`}`;

      try {
        const { content } = await callLovableAI([
          { role: "system", content: openingPrompt },
          { role: "user", content: `Start the conversation about: ${assignmentTopic}` }
        ], MODEL, 300);

        let translation = "";
        if (userLanguage !== targetLanguage) {
          try {
            const translationResult = await callLovableAI([
              { role: "system", content: `Translate this ${targetLangDisplay} text to ${userLangDisplay}. Only provide the translation.` },
              { role: "user", content },
            ], MODEL, 300);
            translation = translationResult.content;
          } catch (e) { console.error("Opening message translation error:", e); }
        }

        return new Response(
          JSON.stringify({ content, translation }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (openingError) {
        console.error("Error generating opening message:", openingError);
        return new Response(
          JSON.stringify({ error: "Failed to generate opening message" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Main conversation handling
    const input = trimmedMessage;

    // Crisis screen (plan 15 §3.4): runs BEFORE the generic blocklist so a
    // cry for help is never silently swallowed by the content filter —
    // silent blocking of crisis signals is forbidden; we must surface the
    // support message. Log category + timestamp + user id only, never the
    // learner's verbatim text (crisis runbook).
    const crisis = shouldEscalate(input);
    if (crisis.escalate) {
      console.warn(
        `safety_event: category=${crisis.category} user=${user.id} at=${new Date().toISOString()}`
      );
      const crisisContent = crisisResourceMessage(crisis.category);
      return new Response(
        JSON.stringify({
          content: crisisContent,
          translation: "",
          updatedHistory: [
            ...limitedHistory,
            { role: "user", content: input },
            { role: "assistant", content: crisisContent },
          ].slice(-MAX_HISTORY_LENGTH),
          usingFallbackModel: false,
          safetyEscalation: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { filtered, reason } = await filterProhibitedContent(input);
    if (filtered) {
      return new Response(
        JSON.stringify({ reply: "I'm sorry, but I cannot process this request due to content policy violations." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CEFR-based behavior
    const LEVEL_BEHAVIOR: Record<string, {
      cefr: string; nativeLanguageRatio: number; responseComplexity: string;
      sentenceLength: string; vocabularyLevel: string; grammarFocus: string[]; explanationStyle: string;
    }> = {
      'A1': { cefr: 'A1', nativeLanguageRatio: 0.6, responseComplexity: 'simple', sentenceLength: 'short', vocabularyLevel: 'basic_500', grammarFocus: ['present_simple', 'basic_questions'], explanationStyle: 'native_heavy' },
      'A2': { cefr: 'A2', nativeLanguageRatio: 0.45, responseComplexity: 'simple', sentenceLength: 'short', vocabularyLevel: 'elementary_1000', grammarFocus: ['present_continuous', 'past_simple'], explanationStyle: 'native_heavy' },
      'B1': { cefr: 'B1', nativeLanguageRatio: 0.25, responseComplexity: 'moderate', sentenceLength: 'medium', vocabularyLevel: 'intermediate_2000', grammarFocus: ['past_tenses', 'conditionals_type1'], explanationStyle: 'mixed' },
      'B2': { cefr: 'B2', nativeLanguageRatio: 0.12, responseComplexity: 'complex', sentenceLength: 'medium', vocabularyLevel: 'upper_intermediate_4000', grammarFocus: ['conditionals_type2_3', 'passive_voice'], explanationStyle: 'target_heavy' },
      'C1': { cefr: 'C1', nativeLanguageRatio: 0.05, responseComplexity: 'advanced', sentenceLength: 'long', vocabularyLevel: 'advanced_6000', grammarFocus: ['complex_structures', 'nuanced_expressions'], explanationStyle: 'target_only' },
      'C2': { cefr: 'C2', nativeLanguageRatio: 0.02, responseComplexity: 'advanced', sentenceLength: 'varied', vocabularyLevel: 'native_like', grammarFocus: ['stylistic_choices', 'idiomatic_expressions'], explanationStyle: 'target_only' }
    };
    
    const conversationToLevelMap: Record<string, string> = { 'basic': 'A1', 'intermediate': 'B1', 'advanced': 'C1' };
    const effectiveCefrLevel = cefrLevel 
      ? cefrLevel.toUpperCase().split('/')[0].replace('+', '') 
      : conversationToLevelMap[conversationLevel] || 'B1';
    
    const currentLevel = LEVEL_BEHAVIOR[effectiveCefrLevel] || LEVEL_BEHAVIOR['B1'];
    
    // Build complexity guidance
    const complexityMap: Record<string, string> = {
      'short': 'Keep sentences SHORT (5-10 words max).',
      'medium': 'Use medium-length sentences (10-20 words).',
      'long': 'Use longer, complex sentences with subordinate clauses.',
      'varied': 'Vary sentence length naturally like a native speaker.',
    };
    const complexityGuidance = complexityMap[currentLevel.sentenceLength] || complexityMap['medium'];
    
    const isBeginnerLevel = ['A1', 'A2'].includes(effectiveCefrLevel);
    const nativePercent = Math.round(currentLevel.nativeLanguageRatio * 100);
    const targetPercent = 100 - nativePercent;
    
    let nativeLanguageGuidance = '';
    if (currentLevel.explanationStyle === 'native_heavy') {
      nativeLanguageGuidance = `Use ${userLangDisplay} for ${nativePercent}% of responses. ALWAYS provide ${userLangDisplay} translations in parentheses for new vocabulary.`;
    } else if (currentLevel.explanationStyle === 'mixed') {
      nativeLanguageGuidance = `Use ${targetLangDisplay} for ~${targetPercent}%. Provide ${userLangDisplay} support for complex explanations. No inline translations.`;
    } else if (currentLevel.explanationStyle === 'target_heavy') {
      nativeLanguageGuidance = `Use ${targetLangDisplay} for ${targetPercent}%. Only use ${userLangDisplay} for critical clarifications.`;
    } else {
      nativeLanguageGuidance = `Use ${targetLangDisplay} almost exclusively (${targetPercent}%+). NEVER include inline translations.`;
    }
    
    let systemMessage = `${safetyBlock}

You are a patient and encouraging AI language tutor helping users practice ${targetLangDisplay}.
The user's native language is ${userLangDisplay}.
The user is at CEFR ${currentLevel.cefr} level.

COMPLEXITY: ${complexityGuidance}
Grammar focus: ${currentLevel.grammarFocus.join(', ')}
${nativeLanguageGuidance}

${correctGrammar ? 
`⚠️ GRAMMAR CORRECTION MODE ACTIVE ⚠️
Your response MUST have TWO parts:
PART 1: Reply naturally in ${targetLangDisplay} at ${currentLevel.cefr} level.
PART 2: After a blank line, analyze their message for errors.
Format: "📝 Grammar note: [corrections]"
Only correct explicit errors (wrong conjugations, missing articles, word order issues).
If no errors: "📝 Grammar note: Great job! No corrections needed."` 
: `Respond naturally in ${targetLangDisplay} at ${currentLevel.cefr} level. Do NOT provide grammar corrections unless asked.`}

${assignmentTopic ? `ASSIGNMENT: The student is working on "${assignmentTopic}". Keep the conversation focused on this topic.` : ''}

Always respond primarily in ${targetLangDisplay}.`;

    // Scenario role-play block (server-validated id): appended after the
    // SafetyContext-led prompt above. The CEFR/L1 scaffolding tables are
    // load-bearing pedagogy and stay byte-for-byte untouched.
    if (scenario) {
      systemMessage += `

SCENARIO ROLE-PLAY:
You are playing: ${scenario.persona}.
Scene goal for the learner: ${scenario.goal}.
Register: ${scenario.register}.
Stay in persona the whole conversation — you are a partner inside this scene, not a teacher outside it.
If the scene has not started yet, open it naturally: ${scenario.opening}.
${scenario.twist ? `Mid-conversation, after a few exchanges, introduce this complication ONCE, gently: ${scenario.twist}. Do not repeat it.` : 'Keep the conversation flowing wherever the learner takes it.'}
Keep your turns short${isBeginnerLevel ? ' (at most 2 sentences)' : ''} and end most turns with a question that moves the scene forward.
CORRECTIONS: at most ONE concise recast per learner message, woven naturally into your reply (e.g. "Oh, you WENT there yesterday — nice!"). Never give a grammar lecture mid-conversation.`;
    }

    // Curriculum awareness: steer chat/role-play at the learner's active unit.
    try {
      const curriculumDb = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const snapshot = await getCurriculumSnapshot(curriculumDb, user.id);
      const block = renderCurriculumBlock(snapshot);
      if (block) systemMessage += `\n${block}`;
    } catch (e) {
      console.error("curriculum context unavailable", e);
    }

    console.log(`CEFR: ${effectiveCefrLevel}, Grammar: ${correctGrammar}, Fallback: ${usingFallbackModel}`);

    const modelToUse = usingFallbackModel ? FALLBACK_MODEL : MODEL;

    const { content, tokensUsed } = await callLovableAI([
      { role: "system", content: systemMessage },
      ...limitedHistory,
      { role: "user", content: input },
    ], modelToUse);

    let translation = "";
    let totalTokensUsed = tokensUsed;

    if (userLanguage !== targetLanguage) {
      try {
        const translationResult = await callLovableAI([
          { role: "system", content: `You are a highly accurate translator. Translate the following ${targetLangDisplay} text to ${userLangDisplay}. Only provide the translation, nothing else.` },
          { role: "user", content },
        ], MODEL);
        
        translation = translationResult.content;
        totalTokensUsed += translationResult.tokensUsed;
      } catch (translationError) {
        console.error("Translation error:", translationError);
      }
    }

    // Track usage
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      // Increment text message count
      await supabaseAdmin.rpc('increment_tts_token_usage', { 
        p_user_id: user.id, 
        p_tokens: totalTokensUsed 
      }).then(({ error }) => {
        if (error) console.error('Failed to track tokens:', error);
      });
    } catch (trackingError) {
      console.error('Error tracking usage:', trackingError);
    }

    const updatedHistory = [
      ...limitedHistory,
      { role: "user", content: input },
      { role: "assistant", content },
    ].slice(-MAX_HISTORY_LENGTH);

    return new Response(
      JSON.stringify({ content, translation, updatedHistory, usingFallbackModel }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in chat-with-tutor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
