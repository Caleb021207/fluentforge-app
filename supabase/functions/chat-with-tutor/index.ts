
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { corsHeaders, filterProhibitedContent } from "./config.ts";
import { generateHints } from "./hints.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

// Add FERPA compliance logging
function logDataAccess(userId: string, dataType: string, purpose: string) {
  // Log to console for now, in production this could be a database entry
  const timestamp = new Date().toISOString();
  console.log(`FERPA Access Log: User ${userId} accessed ${dataType} for ${purpose} at ${timestamp}`);
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
      userLanguage, 
      targetLanguage, 
      conversationHistory = []
    } = requestData;

    // Log the access for FERPA compliance
    logDataAccess("anonymous", "language_practice", "language_learning");

    console.log(`Received message: ${message} Request type: ${requestType} User language: ${userLanguage} Target language: ${targetLanguage} Request translation: ${requestData.requestTranslation}`);

    // Handle hint requests
    if (requestType === 'hint') {
      const suggestions = await generateHints(
        conversationHistory,
        targetLanguage || "spanish",
        userLanguage || "english"
      );
      
      return new Response(
        JSON.stringify({ suggestions }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    // Step 2: Generate Reply from OpenAI
    const systemMessage = `You are a patient and encouraging AI language tutor. Your goal is to help the user practice ${
      targetLanguage || "Spanish"
    }. Keep your responses concise and helpful.
    The user is at a CEFR level of B1.
    If the user asks you to translate something, please provide the translation.
    If the user makes grammatical errors, gently correct them and explain the correction.
    If the user asks a question about grammar or vocabulary, provide a clear and concise answer.
    If the user is struggling, offer encouragement and suggest simpler ways to express themselves.
    If the user is doing well, offer praise and suggest more advanced vocabulary or grammar.
    You should always respond in ${targetLanguage || "Spanish"}.`;

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
    if (userLanguage && userLanguage !== "english" && userLanguage !== targetLanguage) {
      try {
        const translationResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a highly accurate translator. Translate the following ${targetLanguage} text to ${userLanguage}. Only provide the translation, nothing else.`,
            },
            { role: "user", content },
          ],
          max_tokens: 800,
        });
        
        translation = translationResponse.choices[0].message.content;
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
