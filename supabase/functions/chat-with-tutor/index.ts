
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { corsHeaders, filterProhibitedContent } from "./config.ts";
import { generateHints } from "./hints.ts";
import { getLanguageDisplayName, determineLanguagePair, getUserNativeLanguage } from "./languageUtils.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

// Add FERPA compliance logging
function logDataAccess(userId: string, dataType: string, purpose: string) {
  // Log to console for now, in production this could be a database entry
  const timestamp = new Date().toISOString();
  console.log(`FERPA Access Log: User ${userId} accessed ${dataType} for ${purpose} at ${timestamp}`);
}

// Helper function to validate language parameter
function validateLanguage(lang: string | undefined): string {
  if (!lang) return "english"; // Default to English if undefined
  
  // Normalize language name to lowercase for comparison
  const normalizedLang = lang.toLowerCase();
  
  // List of supported languages
  const supportedLanguages = [
    "english", "spanish", "portuguese", "french", "japanese", 
    "korean", "mandarin", "cantonese", "russian", "arabic", 
    "hindi", "vietnamese", "ukrainian", "indonesian", "farsi", 
    "urdu", "pashto", "swahili", "bengali", "somali", 
    "yoruba", "amharic", "haitian", "malayalam", "igbo", 
    "polish", "turkish", "romanian", "tagalog", "german",
    "italian", "thai", "gujarati", "punjabi", "nepali"
  ];
  
  // Return normalized language if supported, otherwise default to English
  return supportedLanguages.includes(normalizedLang) 
    ? normalizedLang 
    : "english";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      console.error('No authorization header provided');
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
      console.error('Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);

    // Get request data
    const requestData = await req.json();
    const { 
      message, 
      requestType, 
      userLanguage: rawUserLanguage, 
      targetLanguage: rawTargetLanguage, 
      conversationHistory = [],
      conversationLevel = "intermediate",  // Conversation level setting (basic/intermediate/advanced)
      cefrLevel = null, // Direct CEFR level override (A1, A2, B1, B2, C1, C2)
      correctGrammar = false, // Flag to control grammar correction
      assignmentTopic = "", // Assignment topic for contextual hints
      isOpeningMessage = false // Whether this is an AI-generated opening message for an assignment
    } = requestData;

    // ===== INPUT VALIDATION =====
    // Skip message validation for hint requests and opening_message requests (they don't need a user message)
    let trimmedMessage = "";
    
    if (requestType !== 'hint' && requestType !== 'opening_message') {
      // Validate message exists and is a string
      if (!message || typeof message !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message format' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Trim and check for empty messages
      trimmedMessage = message.trim();
      if (trimmedMessage.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Message cannot be empty' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Enforce maximum message length to prevent API abuse
      const MAX_MESSAGE_LENGTH = 2000;
      if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ 
            error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` 
          }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Validate and limit conversation history
    if (!Array.isArray(conversationHistory)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conversation history format' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check text practice token limits (skip for hint requests)
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
          console.log('User has reached text practice limit, switching to cheaper model fallback:', limitCheck[0]);
          usingFallbackModel = true;
        }
      } catch (limitCheckError) {
        console.error('Failed to check usage limits:', limitCheckError);
        // Continue with request even if limit check fails
      }
    }

    // Limit conversation history to last 20 messages to prevent memory issues
    const MAX_HISTORY_LENGTH = 20;
    const limitedHistory = conversationHistory.length > MAX_HISTORY_LENGTH
      ? conversationHistory.slice(-MAX_HISTORY_LENGTH)
      : conversationHistory;

    // Validate each history item
    for (const item of limitedHistory) {
      if (!item.role || !item.content || typeof item.content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid conversation history format' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Basic prompt injection detection (log suspicious patterns)
    const suspiciousPatterns = [
      /ignore (all |previous )?instructions/i,
      /system prompt/i,
      /repeat (your|the) instructions/i,
      /<script/i,
      /javascript:/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(trimmedMessage))) {
      console.warn(`Potential prompt injection detected from user ${user.id}:`, trimmedMessage.substring(0, 100));
      // Log but still process - most are false positives
    }
    // ===== END INPUT VALIDATION =====

    // Validate language parameters
    const userLanguage = validateLanguage(rawUserLanguage);
    let targetLanguage = validateLanguage(rawTargetLanguage);
    
    // Safety check: if userLanguage === targetLanguage, make one of them different
    if (userLanguage === targetLanguage && userLanguage !== 'english') {
      targetLanguage = 'english'; // Default target language for non-English speakers
    } else if (userLanguage === targetLanguage) {
      targetLanguage = 'spanish'; // Default for English speakers
    }
    
    console.log(`Validated languages: User language: ${userLanguage}, Target language: ${targetLanguage}`);

    // Log the access for FERPA compliance with actual user ID
    logDataAccess(user.id, "language_practice", "language_learning");

    console.log(`Received message: ${trimmedMessage.substring(0, 100)} Request type: ${requestType} User language: ${userLanguage} Target language: ${targetLanguage} Request translation: ${requestData.requestTranslation} Grammar correction: ${correctGrammar} Conversation level: ${conversationLevel} Conversation history length: ${limitedHistory.length}`);

    // Handle hint requests
    if (requestType === 'hint') {
      try {
        // Determine effective CEFR level for hints
        const hintCefrLevel = cefrLevel || 
          (conversationLevel === 'basic' ? 'A1' : 
           conversationLevel === 'advanced' ? 'C1' : 'B1');
        
        console.log(`[hint request] CEFR=${hintCefrLevel}, topic="${(assignmentTopic || '').substring(0, 50)}..."`);
        
        const suggestions = await generateHints(
          limitedHistory,
          targetLanguage || "spanish",
          userLanguage || "english",
          hintCefrLevel,
          assignmentTopic || ""
        );
        
        return new Response(
          JSON.stringify({ suggestions }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (hintError) {
        console.error("Error generating hints:", hintError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate hints",
            suggestions: [
              {
                title: "Greetings",
                suggestions: ["Hola", "Buenos días", "¿Cómo estás?"]
              },
              {
                title: "Questions",
                suggestions: ["¿Qué haces?", "¿De dónde eres?", "¿Te gusta?"]
              }
            ] 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Handle translation requests
    if (requestType === 'translation') {
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a highly accurate translator. Translate the following text from ${targetLanguage || "the detected language"} to ${userLanguage || "english"}. Only provide the translation, nothing else.`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      });

      const translation = translationResponse.choices[0].message.content;
      
      return new Response(
        JSON.stringify({ translation }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle opening message requests for Challenge Mode assignments
    if (requestType === 'opening_message') {
      // Determine effective CEFR level for opening message
      const conversationToLevelMap: Record<string, string> = {
        'basic': 'A1',
        'intermediate': 'B1',
        'advanced': 'C1'
      };
      const effectiveCefrLevel = cefrLevel 
        ? cefrLevel.toUpperCase().split('/')[0].replace('+', '') 
        : conversationToLevelMap[conversationLevel] || 'B1';
      
      const isBeginnerLevel = ['A1', 'A2'].includes(effectiveCefrLevel);
      const targetLangDisplay = getLanguageDisplayName(targetLanguage);
      const userLangDisplay = getLanguageDisplayName(userLanguage);
      
      const openingPrompt = `You are a friendly ${targetLangDisplay} language tutor starting a conversation with a student at CEFR ${effectiveCefrLevel} level.

ASSIGNMENT TOPIC: "${assignmentTopic}"

Your task: Generate a friendly, natural opening message that:
1. Greets the student warmly in ${targetLangDisplay}
2. Directly introduces the assignment topic
3. Asks an opening question to get the conversation started on the topic
4. Uses vocabulary and sentence structure appropriate for ${effectiveCefrLevel} level

${isBeginnerLevel ? `Since this is ${effectiveCefrLevel} level:
- Use very simple, short sentences (5-10 words max)
- Include ${userLangDisplay} translations in parentheses for key phrases
- Make the question easy to answer with basic vocabulary` : `Since this is ${effectiveCefrLevel} level:
- Do NOT include inline parenthetical translations
- Use natural, fluent ${targetLangDisplay}
- The student can use the "Show translation" button if needed`}

Be warm, encouraging, and get straight to the topic!`;

      try {
        const openingResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: openingPrompt },
            { role: "user", content: `Start the conversation about: ${assignmentTopic}` }
          ],
          max_tokens: 300,
        });

        const content = openingResponse.choices[0].message.content || "";
        let translation = "";
        
        // Generate translation for the opening message
        if (userLanguage && userLanguage !== targetLanguage) {
          try {
            const translationResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `Translate this ${targetLangDisplay} text to ${userLangDisplay}. Only provide the translation, nothing else.`,
                },
                { role: "user", content },
              ],
              max_tokens: 300,
            });
            translation = translationResponse.choices[0].message.content || "";
          } catch (translationError) {
            console.error("Opening message translation error:", translationError);
          }
        }

        console.log(`Generated opening message for assignment topic: "${assignmentTopic?.substring(0, 50)}..." at ${effectiveCefrLevel} level`);

        return new Response(
          JSON.stringify({ content, translation }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (openingError) {
        console.error("Error generating opening message:", openingError);
        return new Response(
          JSON.stringify({ error: "Failed to generate opening message" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // If no specific requestType is provided, proceed with conversation handling
    const input = trimmedMessage;

    // Step 1: Filter Prohibited Content
    const { filtered, reason } = await filterProhibitedContent(input);
    if (filtered) {
      console.warn(`Prohibited content detected. Reason: ${reason}`);
      return new Response(
        JSON.stringify({
          reply:
            "I'm sorry, but I cannot process this request due to content policy violations.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user and target language display names for better prompting
    const userLangDisplay = getLanguageDisplayName(userLanguage);
    const targetLangDisplay = getLanguageDisplayName(targetLanguage);

    // Step 2: Generate Reply from OpenAI with updated system message
    // ADAPTIVE PROFICIENCY: Use direct CEFR level if provided, else map from conversationLevel
    
    // CEFR-based behavior configuration (matches src/utils/proficiencyMapping.ts)
    const LEVEL_BEHAVIOR: Record<string, {
      cefr: string;
      nativeLanguageRatio: number;
      responseComplexity: string;
      sentenceLength: string;
      vocabularyLevel: string;
      grammarFocus: string[];
      explanationStyle: string;
    }> = {
      'A1': {
        cefr: 'A1',
        nativeLanguageRatio: 0.6,
        responseComplexity: 'simple',
        sentenceLength: 'short',
        vocabularyLevel: 'basic_500',
        grammarFocus: ['present_simple', 'basic_questions', 'common_nouns'],
        explanationStyle: 'native_heavy'
      },
      'A2': {
        cefr: 'A2',
        nativeLanguageRatio: 0.45,
        responseComplexity: 'simple',
        sentenceLength: 'short',
        vocabularyLevel: 'elementary_1000',
        grammarFocus: ['present_continuous', 'past_simple', 'basic_prepositions'],
        explanationStyle: 'native_heavy'
      },
      'B1': {
        cefr: 'B1',
        nativeLanguageRatio: 0.25,
        responseComplexity: 'moderate',
        sentenceLength: 'medium',
        vocabularyLevel: 'intermediate_2000',
        grammarFocus: ['past_tenses', 'conditionals_type1', 'modal_verbs'],
        explanationStyle: 'mixed'
      },
      'B2': {
        cefr: 'B2',
        nativeLanguageRatio: 0.12,
        responseComplexity: 'complex',
        sentenceLength: 'medium',
        vocabularyLevel: 'upper_intermediate_4000',
        grammarFocus: ['conditionals_type2_3', 'passive_voice', 'reported_speech'],
        explanationStyle: 'target_heavy'
      },
      'C1': {
        cefr: 'C1',
        nativeLanguageRatio: 0.05,
        responseComplexity: 'advanced',
        sentenceLength: 'long',
        vocabularyLevel: 'advanced_6000',
        grammarFocus: ['complex_structures', 'nuanced_expressions', 'formal_registers'],
        explanationStyle: 'target_only'
      },
      'C2': {
        cefr: 'C2',
        nativeLanguageRatio: 0.02,
        responseComplexity: 'advanced',
        sentenceLength: 'varied',
        vocabularyLevel: 'native_like',
        grammarFocus: ['stylistic_choices', 'idiomatic_expressions', 'register_switching'],
        explanationStyle: 'target_only'
      }
    };
    
    // Determine effective CEFR level
    const conversationToLevelMap: Record<string, string> = {
      'basic': 'A1',
      'intermediate': 'B1',
      'advanced': 'C1'
    };
    
    const effectiveCefrLevel = cefrLevel 
      ? cefrLevel.toUpperCase().split('/')[0].replace('+', '') 
      : conversationToLevelMap[conversationLevel] || 'B1';
    
    const currentLevel = LEVEL_BEHAVIOR[effectiveCefrLevel] || LEVEL_BEHAVIOR['B1'];
    
    console.log(`Adaptive proficiency: cefrLevel=${cefrLevel}, conversationLevel=${conversationLevel}, effective=${effectiveCefrLevel}`);
    
    // Build complexity guidance
    let complexityGuidance = '';
    switch (currentLevel.sentenceLength) {
      case 'short':
        complexityGuidance = 'Keep sentences SHORT (5-10 words max). Use simple Subject-Verb-Object structures.';
        break;
      case 'medium':
        complexityGuidance = 'Use medium-length sentences (10-20 words). Include some compound sentences.';
        break;
      case 'long':
        complexityGuidance = 'Use longer, more complex sentences with subordinate clauses.';
        break;
      case 'varied':
        complexityGuidance = 'Vary sentence length naturally like a native speaker.';
        break;
    }
    
    // Vocabulary guidance
    let vocabGuidance = '';
    switch (currentLevel.vocabularyLevel) {
      case 'basic_500':
        vocabGuidance = 'ONLY use the 500 most common words. Avoid idioms and specialized vocabulary.';
        break;
      case 'elementary_1000':
        vocabGuidance = 'Use vocabulary from the 1000 most common words. Introduce simple idioms with explanations.';
        break;
      case 'intermediate_2000':
        vocabGuidance = 'Use vocabulary up to 2000 common words. Include some idiomatic expressions.';
        break;
      case 'upper_intermediate_4000':
        vocabGuidance = 'Use broader vocabulary (4000+ words). Include idioms and phrasal verbs.';
        break;
      case 'advanced_6000':
        vocabGuidance = 'Use advanced vocabulary freely. Include nuanced expressions and register variations.';
        break;
      case 'native_like':
        vocabGuidance = 'Use vocabulary without restrictions. Include regional expressions and cultural references.';
        break;
    }
    
    // Build native language guidance based on proficiency level
    const nativePercent = Math.round(currentLevel.nativeLanguageRatio * 100);
    const targetPercent = 100 - nativePercent;
    
    let nativeLanguageGuidance = '';
    // For A1/A2 levels, include inline translations in parentheses
    // For B1+ levels, do NOT include inline translations - the UI has a "Show translation" toggle
    const isBeginnerLevel = ['A1', 'A2'].includes(effectiveCefrLevel);
    
    if (currentLevel.explanationStyle === 'native_heavy') {
      nativeLanguageGuidance = `LANGUAGE SUPPORT - HIGH NATIVE LANGUAGE MODE (${nativePercent}% ${userLangDisplay}):
- Use ${userLangDisplay} for ${nativePercent}% of your responses
- ALWAYS provide ${userLangDisplay} translations for new vocabulary IN PARENTHESES like: "Hola (Hello)"
- Explain grammar concepts primarily in ${userLangDisplay}
- When the student seems confused, immediately switch to ${userLangDisplay}
- Use short, simple ${targetLangDisplay} phrases with immediate translations in parentheses`;
    } else if (currentLevel.explanationStyle === 'mixed') {
      nativeLanguageGuidance = `LANGUAGE SUPPORT - BALANCED MODE (${nativePercent}% ${userLangDisplay}):
- Use ${targetLangDisplay} for most of your response (~${targetPercent}%)
- Provide ${userLangDisplay} support for complex explanations
- Translate new or difficult vocabulary ONLY when asked
- Do NOT include inline parenthetical translations - the student can use the "Show translation" button
- Mix languages naturally based on topic difficulty`;
    } else if (currentLevel.explanationStyle === 'target_heavy') {
      nativeLanguageGuidance = `LANGUAGE SUPPORT - IMMERSIVE MODE (${nativePercent}% ${userLangDisplay}):
- Use ${targetLangDisplay} for ${targetPercent}% of your response
- Only use ${userLangDisplay} for critical clarifications
- Do NOT include inline parenthetical translations - the student can use the "Show translation" button
- Challenge the student to understand from context`;
    } else {
      nativeLanguageGuidance = `LANGUAGE SUPPORT - FULL IMMERSION (${nativePercent}% ${userLangDisplay}):
- Use ${targetLangDisplay} almost exclusively (${targetPercent}%+)
- Only use ${userLangDisplay} if absolutely critical for comprehension
- NEVER include inline parenthetical translations - the student is at an advanced level
- Treat the student as near-native level`;
    }
    
    let systemMessage = `You are a patient and encouraging AI language tutor helping users practice ${targetLangDisplay}.
The user's native language is ${userLangDisplay}.
The user is at CEFR ${currentLevel.cefr} level.

COMPLEXITY REQUIREMENTS:
${complexityGuidance}
${vocabGuidance}
Grammar focus: ${currentLevel.grammarFocus.join(', ')}

${nativeLanguageGuidance}

    ${correctGrammar ? 
  `⚠️ GRAMMAR CORRECTION MODE ACTIVE ⚠️

Your response MUST have TWO parts:

PART 1 - Natural Response:
Reply naturally to their message in ${targetLangDisplay} at ${currentLevel.cefr} level. Be conversational and engaging.

PART 2 - Grammar Feedback (MANDATORY):
After your response, add a blank line, then analyze their MOST RECENT message for EXPLICITLY NECESSARY errors only.

CRITICAL: Only correct errors that are clearly wrong or affect comprehension. DO NOT correct:
- Stylistic preferences (e.g., "the church" vs "to church" - both can be correct)
- Minor phrasing variations that are grammatically acceptable
- Informal vs formal language choices
- Natural conversational shortcuts

Format: "📝 Grammar note: [your corrections here]"

ONLY correct these EXPLICIT errors:
- Wrong verb conjugations that make the sentence incorrect (not just less formal)
- Completely missing or incorrect articles when required by grammar rules
- Word order that makes the sentence confusing or incomprehensible
- Prepositions that change the meaning or make it unclear
- Missing accents that change the meaning of words
- Gender agreement errors that are clearly wrong
- Mixing languages when the user is trying to speak in only one language

If their message has NO explicit errors, write: "📝 Grammar note: Great job! No corrections needed."

Be specific, helpful, and encouraging. When in doubt, don't correct it.` 
  : 
  `CONVERSATION MODE: Respond naturally in ${targetLangDisplay} at ${currentLevel.cefr} level. Do NOT provide grammar corrections unless specifically asked.`
}

${assignmentTopic ? `
ASSIGNMENT CONTEXT (VERY IMPORTANT):
The student is working on this specific assignment: "${assignmentTopic}"
- ALWAYS keep the conversation focused on this topic
- Guide the conversation back to this topic if the student strays
- Help the student practice language skills directly related to this task
- Do NOT let the conversation wander to unrelated topics
` : ''}

Always respond primarily in ${targetLangDisplay}, following the language mixing guidelines above based on the user's level. If asked to translate or explain grammar, provide clear answers.`;

    console.log(`Grammar correction enabled: ${correctGrammar}, Effective CEFR: ${effectiveCefrLevel}, Native language ratio: ${currentLevel.nativeLanguageRatio}`);

    // Use cheaper model if limit is reached
    const modelToUse = usingFallbackModel ? "gpt-3.5-turbo" : "gpt-4o-mini";
    console.log(`Using model: ${modelToUse}${usingFallbackModel ? ' (fallback due to token limit)' : ''}`);

    // Call OpenAI for conversation response
    const chatResponse = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: "system", content: systemMessage },
        ...limitedHistory,
        { role: "user", content: input },
      ],
      max_tokens: 800,
    });

    const content = chatResponse.choices[0].message.content;
    let translation = "";
    let totalTokensUsed = chatResponse.usage?.total_tokens || 0;

    // Generate translation if needed
    if (userLanguage && userLanguage !== targetLanguage) {
      try {
        const translationResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a highly accurate translator. Translate the following ${targetLangDisplay} text to ${userLangDisplay}. Only provide the translation, nothing else.`,
            },
            { role: "user", content },
          ],
          max_tokens: 800,
        });
        
        translation = translationResponse.choices[0].message.content || "";
        totalTokensUsed += translationResponse.usage?.total_tokens || 0;
        console.log(`Generated translation from ${targetLanguage} to ${userLanguage}: ${translation.substring(0, 50)}...`);
      } catch (translationError) {
        console.error("Translation error:", translationError);
      }
    }

    // Track text practice token usage
    try {
      console.log(`Tracking ${totalTokensUsed} tokens for user ${user.id}`);
      
      // Create admin client for tracking
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      const { error: trackingError } = await supabaseAdmin.rpc(
        'increment_text_practice_token_usage',
        { 
          p_user_id: user.id, 
          p_tokens: totalTokensUsed 
        }
      );

      if (trackingError) {
        console.error('Failed to track text practice tokens:', trackingError);
      } else {
        console.log(`Successfully tracked ${totalTokensUsed} tokens for user ${user.id}`);
      }
    } catch (trackingError) {
      console.error('Error tracking text practice usage:', trackingError);
      // Don't fail the request if tracking fails
    }

    // Update conversation history (limited to prevent unbounded growth)
    const updatedHistory = [
      ...limitedHistory,
      { role: "user", content: input },
      { role: "assistant", content },
    ].slice(-MAX_HISTORY_LENGTH);

    // Return the response
    return new Response(
      JSON.stringify({
        content,
        translation,
        updatedHistory,
        usingFallbackModel,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-with-tutor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
