
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
      conversationLevel = "intermediate",  // Add conversation level with default
      correctGrammar = false // Flag to control grammar correction
    } = requestData;

    // ===== INPUT VALIDATION =====
    // Skip message validation for hint requests (they only need conversationHistory)
    let trimmedMessage = "";
    
    if (requestType !== 'hint') {
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
        const suggestions = await generateHints(
          limitedHistory,
          targetLanguage || "spanish", // Default if still undefined
          userLanguage || "english"
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
    // Modified to only correct grammar if explicitly requested
    // Map conversation level to CEFR levels and descriptions
    const levelMapping = {
      basic: {
        cefr: "A1-A2",
        description: "Use simple vocabulary, short sentences, and basic grammar structures. Speak about everyday topics like family, food, weather, and daily routines."
      },
      intermediate: {
        cefr: "B1", 
        description: "Use more complex sentences with connecting words. Discuss opinions, experiences, plans, and abstract concepts. Include varied vocabulary and grammar structures."
      },
      advanced: {
        cefr: "B2-C1",
        description: "Use sophisticated vocabulary, complex sentence structures, and nuanced expressions. Discuss complex topics, abstract ideas, and use idiomatic expressions appropriately."
      }
    };
    
    const currentLevel = levelMapping[conversationLevel as keyof typeof levelMapping] || levelMapping.intermediate;
    
    let systemMessage = `You are a patient and encouraging AI language tutor helping users practice ${targetLangDisplay}.
The user's native language is ${userLangDisplay}.
The user is at ${currentLevel.cefr} level. ${currentLevel.description}

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

Example of what TO correct:
User: "hola how you esta hoy"
You should note: "📝 Grammar note: Try 'Hola, ¿cómo estás hoy?' - 'how you' should be '¿cómo estás?' (with accent), and stay in Spanish throughout."

Example of what NOT to correct:
User: "I'm going to the church" (both "to church" and "to the church" can be correct)
DO NOT correct this - it's a stylistic preference, not an error.

If their message has NO explicit errors, write: "📝 Grammar note: Great job! No corrections needed."

Be specific, helpful, and encouraging. When in doubt, don't correct it.` 
  : 
  `CONVERSATION MODE: Respond naturally in ${targetLangDisplay} at ${currentLevel.cefr} level. Do NOT provide grammar corrections unless specifically asked.`
}

Always respond in ${targetLangDisplay}. If asked to translate or explain grammar, provide clear answers.`;

    console.log(`Grammar correction enabled: ${correctGrammar}, Conversation level: ${conversationLevel} (${currentLevel.cefr})`);

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
