
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Log the access for FERPA compliance
    logDataAccess("anonymous", "language_practice", "language_learning");

    console.log(`Received message: ${message} Request type: ${requestType} User language: ${userLanguage} Target language: ${targetLanguage} Request translation: ${requestData.requestTranslation} Grammar correction: ${correctGrammar} Conversation level: ${conversationLevel} Conversation history length: ${conversationHistory.length}`);

    // Handle hint requests
    if (requestType === 'hint') {
      try {
        const suggestions = await generateHints(
          conversationHistory,
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
    const input = message;

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
    
    let systemMessage = `You are a patient and encouraging AI language tutor. Your goal is to help the user practice ${targetLangDisplay}.
    The user's native language is ${userLangDisplay}.
    The user is at a ${currentLevel.cefr} level. ${currentLevel.description}
    
    ${correctGrammar ? 
      `GRAMMAR CORRECTION MODE: The user wants grammar feedback. When responding:
      1. FIRST provide your natural response to their message at their level (${currentLevel.cefr})
      2. THEN, ONLY if you notice ACTUAL grammar errors in their MOST RECENT message, add a separate paragraph starting with "📝 Grammar note:"
      
      CRITICAL: Before flagging any error, verify it is ACTUALLY incorrect in their text.
      
      ONLY correct errors like:
      - Wrong verb conjugation: "yo es" → "yo soy"
      - Missing required articles: "quiero manzana" → "quiero una manzana"  
      - Incorrect word order: "casa grande la" → "la casa grande"
      - Wrong tense affecting meaning
      
      DO NOT correct:
      - Punctuation (missing commas, periods, accents, question marks)
      - Stylistic choices that are already grammatically correct
      - Missing exclamation points or question marks
      - Informal vs formal register
      - Things that are ALREADY CORRECT (e.g., "podrías ayudarme con eso" is already correct)
      
      If you're unsure whether something is wrong, DO NOT flag it.
      Be encouraging and conservative - only flag clear errors that affect comprehension.
      Focus ONLY on the user's most recent message, not previous ones.` 
      : 
      `CONVERSATION MODE: Focus on natural conversation flow at the ${currentLevel.cefr} level. Do NOT correct grammar errors unless the user specifically asks for help with grammar.`
    }
    
    Always facilitate engaging conversation and respond in ${targetLangDisplay} at the appropriate ${currentLevel.cefr} level.
    If the user asks you to translate something, provide the translation.
    If the user asks a question about grammar or vocabulary, provide a clear answer.`;

    console.log(`Grammar correction enabled: ${correctGrammar}, Conversation level: ${conversationLevel} (${currentLevel.cefr})`);

    // Call OpenAI for conversation response
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        ...conversationHistory,
        { role: "user", content: input },
      ],
      max_tokens: 800,
    });

    const content = chatResponse.choices[0].message.content;
    let translation = "";

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
        console.log(`Generated translation from ${targetLanguage} to ${userLanguage}: ${translation.substring(0, 50)}...`);
      } catch (translationError) {
        console.error("Translation error:", translationError);
      }
    }

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: input },
      { role: "assistant", content },
    ];

    // Return the response
    return new Response(
      JSON.stringify({
        content,
        translation,
        updatedHistory,
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
