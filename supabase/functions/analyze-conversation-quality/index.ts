
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize OpenAI and Supabase clients
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, classroomId, sessionId, messages } = await req.json();

    if (!userId || !messages || !Array.isArray(messages) || messages.length < 4) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid request data. User ID and message history required. At least 4 messages needed for analysis." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract only user messages for analysis
    const userMessages = messages.filter(msg => msg.role === "user").map(msg => msg.content);

    // Format prompt for OpenAI using STAMP/ACTFL framework criteria
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert language assessment system trained in STAMP (STAndards-based Measurement of Proficiency) and ACTFL (American Council on the Teaching of Foreign Languages) frameworks. Analyze the following messages from a language learner and provide an objective assessment of their grammar accuracy (0-100) and conversation complexity (0-100).

ASSESSMENT CRITERIA:

Grammar Accuracy (0-100):
- 90-100: Near-native control; rare errors that don't impede communication
- 80-89: Strong grammatical control with occasional errors in complex structures
- 70-79: Good control of basic structures; some errors in advanced forms
- 60-69: Adequate control of present tense and simple structures; frequent errors in complex tenses
- 50-59: Basic grammatical control; errors are frequent but meaning is usually clear
- 40-49: Limited control; errors regularly impede communication
- Below 40: Minimal control; communication heavily impeded by errors

Conversation Complexity (0-100) - Based on ACTFL/STAMP Proficiency Levels:
- 90-100 (Superior/Distinguished): Abstract concepts, hypotheticals, nuanced arguments, extended discourse
- 80-89 (Advanced High): Complex narration, explanation of abstract topics, persuasion with supporting detail
- 70-79 (Advanced Mid): Detailed descriptions, past/future narration, expressing opinions with reasons
- 60-69 (Advanced Low): Connected discourse on familiar topics, basic narration in multiple time frames
- 50-59 (Intermediate High): Sentence-level discourse, some paragraph creation, comfortably handles routine situations
- 40-49 (Intermediate Mid): Strings of sentences, can narrate and describe in present tense
- 30-39 (Intermediate Low): Simple sentences, questions and statements about familiar topics
- 20-29 (Novice High): Memorized phrases and simple combinations, limited vocabulary
- Below 20 (Novice Mid/Low): Single words, lists, memorized phrases only

Evaluate based on:
- Vocabulary range and sophistication
- Sentence structure complexity (simple vs compound vs complex sentences)
- Time frame usage (present only vs multiple tenses)
- Discourse level (word/phrase, sentence, paragraph, extended)
- Topic handling (concrete vs abstract)
- Communication strategies (circumlocution, self-correction, elaboration)

DO NOT include any explanations, just return a JSON object with these scores and nothing else.
Example response format:
{"grammarAccuracy": 85, "conversationComplexity": 70}`,
        },
        {
          role: "user",
          content: "Language learner messages:\n" + userMessages.join("\n")
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    // Extract metrics from AI response
    const analysisText = analysisResponse.choices[0].message.content;
    let metrics;
    try {
      metrics = JSON.parse(analysisText || "{}");
      
      // Validate metrics format
      if (!analysisText || typeof metrics.grammarAccuracy !== 'number' || typeof metrics.conversationComplexity !== 'number') {
        throw new Error("Invalid metrics format");
      }
      
      // Ensure values are within 0-100 range
      metrics.grammarAccuracy = Math.min(100, Math.max(0, metrics.grammarAccuracy));
      metrics.conversationComplexity = Math.min(100, Math.max(0, metrics.conversationComplexity));
      
      // Add message count
      metrics.messageCount = userMessages.length;
      
    } catch (parseError) {
      console.error("Failed to parse metrics:", parseError, "Raw response:", analysisText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to parse analysis results" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store metrics in database (optional - only if user is authenticated)
    if (userId !== "anonymous-or-current-user-id" && userId !== "anonymous") {
      try {
        const { error } = await supabase.from("student_language_metrics").insert({
          user_id: userId,
          session_id: sessionId,
          grammar_accuracy: metrics.grammarAccuracy,
          conversation_complexity: metrics.conversationComplexity,
          message_count: metrics.messageCount
        });

        if (error) {
          console.error("Error storing metrics:", error);
          // Continue anyway, don't fail the response
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue anyway, don't fail the response
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-conversation-quality function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An error occurred during analysis" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
