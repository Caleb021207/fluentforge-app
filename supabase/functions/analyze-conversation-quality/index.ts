
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

    // Format prompt for OpenAI
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert language assessment system. Analyze the following messages from a language learner and provide an objective assessment of their grammar accuracy (0-100) and conversation complexity (0-100).
            - Grammar accuracy: correctness of grammar, syntax, verb conjugations, etc.
            - Conversation complexity: complexity of vocabulary, sentence structure, and concepts expressed.
            DO NOT include any explanations, just return a JSON object with these scores and nothing else.
            Example response format:
            {"grammarAccuracy": 85, "conversationComplexity": 70}`,
        },
        {
          role: "user",
          content: "Language learner messages:\n" + userMessages.join("\n")
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    // Extract metrics from AI response
    const analysisText = analysisResponse.choices[0].message.content;
    let metrics;
    try {
      metrics = JSON.parse(analysisText);
      
      // Validate metrics format
      if (typeof metrics.grammarAccuracy !== 'number' || typeof metrics.conversationComplexity !== 'number') {
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

    // Try to store metrics in database
    // Check if the user is authenticated and not anonymous
    if (userId !== "anonymous-or-current-user-id" && userId !== "anonymous") {
      try {
        // First try to get a classroom ID for this user if none was provided
        let targetClassroomId = classroomId;
        
        if (!targetClassroomId) {
          // Try to get the user's classroom if they're in one
          const { data: memberships, error: membershipError } = await supabase
            .from("classroom_memberships")
            .select("classroom_id")
            .eq("student_id", userId)
            .limit(1)
            .maybeSingle();
            
          if (!membershipError && memberships && memberships.classroom_id) {
            targetClassroomId = memberships.classroom_id;
            console.log("Found classroom ID for user:", targetClassroomId);
          }
        }

        if (targetClassroomId) {
          const { error } = await supabase.from("student_language_metrics").insert({
            user_id: userId,
            classroom_id: targetClassroomId,
            session_id: sessionId,
            grammar_accuracy: metrics.grammarAccuracy,
            conversation_complexity: metrics.conversationComplexity,
            message_count: metrics.messageCount
          });

          if (error) {
            console.error("Error storing metrics:", error);
            // Continue anyway, don't fail the response
          } else {
            // If successful, update the aggregate metrics in student_metrics
            await supabase.rpc("update_student_language_aggregate_metrics", {
              target_student_id: userId
            }).catch(err => {
              console.error("Error updating aggregate metrics:", err);
            });
          }
        } else {
          console.log("No classroom ID available, skipping metrics storage");
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
        error: error.message || "An error occurred during analysis" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
