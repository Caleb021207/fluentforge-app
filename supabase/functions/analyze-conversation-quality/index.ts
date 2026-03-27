import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, classroomId, sessionId, messages } = await req.json();

    if (!userId || !messages || !Array.isArray(messages) || messages.length < 4) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request data. User ID and message history required. At least 4 messages needed for analysis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userMessages = messages.filter((msg: any) => msg.role === "user").map((msg: any) => msg.content);

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert language assessment system. Analyze the following messages from a language learner and provide an objective assessment of their grammar accuracy (0-100) and conversation complexity (0-100).

Grammar Accuracy (0-100): 90-100 near-native, 80-89 strong control, 70-79 good basic control, 60-69 adequate simple structures, 50-59 basic control, 40-49 limited, below 40 minimal.

Conversation Complexity (0-100): 90-100 Superior/Distinguished, 80-89 Advanced High, 70-79 Advanced Mid, 60-69 Advanced Low, 50-59 Intermediate High, 40-49 Intermediate Mid, 30-39 Intermediate Low, 20-29 Novice High, below 20 Novice.

DO NOT include any explanations, just return a JSON object with these scores and nothing else.
Example: {"grammarAccuracy": 85, "conversationComplexity": 70}`,
          },
          {
            role: "user",
            content: "Language learner messages:\n" + userMessages.join("\n")
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    let metrics;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      metrics = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
      if (typeof metrics.grammarAccuracy !== 'number' || typeof metrics.conversationComplexity !== 'number') {
        throw new Error("Invalid metrics format");
      }
      metrics.grammarAccuracy = Math.min(100, Math.max(0, metrics.grammarAccuracy));
      metrics.conversationComplexity = Math.min(100, Math.max(0, metrics.conversationComplexity));
      metrics.messageCount = userMessages.length;
    } catch (parseError) {
      console.error("Failed to parse metrics:", parseError, "Raw:", analysisText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userId !== "anonymous-or-current-user-id" && userId !== "anonymous") {
      try {
        await supabase.from("student_language_metrics").insert({
          user_id: userId,
          session_id: sessionId,
          grammar_accuracy: metrics.grammarAccuracy,
          conversation_complexity: metrics.conversationComplexity,
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, metrics }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-conversation-quality:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
