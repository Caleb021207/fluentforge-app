
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import OpenAI from "https://esm.sh/openai@4.20.1";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Access OpenAI API key from environment variables
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") as string;
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

interface AnalysisRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  userId: string;
  classroomId: string | null;
  sessionId?: string;
}

interface AnalysisResult {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}

// Simple function to extract unique words from text
function calculateVocabularyDiversity(messages: Array<{ role: string; content: string }>) {
  // Only analyze user messages
  const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content);
  
  if (userMessages.length === 0) return null;
  
  // Combine all user messages
  const text = userMessages.join(" ").toLowerCase();
  
  // Split into words and remove punctuation
  const words = text.split(/\s+/).map(word => word.replace(/[^\w\s']|_/g, "")).filter(word => word.length > 0);
  
  if (words.length === 0) return null;
  
  // Count unique words
  const uniqueWords = new Set(words);
  
  // Calculate type-token ratio (TTR)
  return uniqueWords.size / words.length;
}

async function analyzeWithAI(messages: Array<{ role: string; content: string }>): Promise<AnalysisResult> {
  try {
    // Extract user messages for analysis
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) {
      return {
        grammarAccuracy: 0,
        conversationComplexity: 0,
        messageCount: 0
      };
    }
    
    // Prepare analysis prompt for OpenAI
    const systemPrompt = `
      You are an expert language teacher who assesses language learning conversations.
      Analyze the following conversation messages from a language learner.
      
      Score the learner on two metrics:
      1. Grammar Accuracy (0-100): How correctly the learner uses grammar
      2. Conversation Complexity (0-100): The complexity level of vocabulary and sentence structures
      
      Return ONLY a JSON object with the format:
      {
        "grammarAccuracy": number,
        "conversationComplexity": number,
        "explanation": "brief explanation of scores"
      }
    `;
    
    const messagesFormatted = userMessages.map((msg, i) => `Message ${i+1}: ${msg.content}`).join("\n\n");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze these learner messages:\n\n${messagesFormatted}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });
    
    const analysisText = response.choices[0].message.content;
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText);
      
      return {
        grammarAccuracy: Math.min(Math.max(0, analysis.grammarAccuracy), 100), // Ensure between 0-100
        conversationComplexity: Math.min(Math.max(0, analysis.conversationComplexity), 100), // Ensure between 0-100
        messageCount: userMessages.length,
        vocabularyDiversity: calculateVocabularyDiversity(messages)
      };
    } catch (parseError) {
      console.error("Error parsing analysis result:", parseError);
      console.log("Raw analysis text:", analysisText);
      
      // Return default values if parsing fails
      return {
        grammarAccuracy: 50,
        conversationComplexity: 50,
        messageCount: userMessages.length,
        vocabularyDiversity: calculateVocabularyDiversity(messages)
      };
    }
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    
    // Return default values if API call fails
    return {
      grammarAccuracy: 50,
      conversationComplexity: 50,
      messageCount: messages.filter(msg => msg.role === 'user').length,
      vocabularyDiversity: calculateVocabularyDiversity(messages)
    };
  }
}

// Find the user's classroom ID if not provided
async function getStudentClassroomId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('classroom_memberships')
      .select('classroom_id')
      .eq('student_id', userId)
      .limit(1);
    
    if (error) throw error;
    
    return data && data.length > 0 ? data[0].classroom_id : null;
  } catch (error) {
    console.error("Error fetching classroom ID:", error);
    return null;
  }
}

// Save metrics to the database
async function saveMetrics(
  userId: string, 
  classroomId: string | null,
  sessionId: string | undefined,
  metrics: AnalysisResult
): Promise<void> {
  try {
    if (!classroomId) {
      classroomId = await getStudentClassroomId(userId);
    }
    
    // Skip if we can't determine classroom
    if (!classroomId) {
      console.warn("Could not determine classroom ID for user:", userId);
      return;
    }
    
    // Insert metrics record
    const { error } = await supabase
      .from('student_language_metrics')
      .insert({
        user_id: userId,
        classroom_id: classroomId,
        session_id: sessionId,
        grammar_accuracy: metrics.grammarAccuracy,
        conversation_complexity: metrics.conversationComplexity,
        message_count: metrics.messageCount,
        vocabulary_diversity: metrics.vocabularyDiversity
      });
    
    if (error) throw error;
    
    // Update the aggregated metrics in student_metrics table
    await updateAggregateMetrics(userId);
    
  } catch (error) {
    console.error("Error saving metrics:", error);
    throw error;
  }
}

// Update the aggregate metrics in the student_metrics table
async function updateAggregateMetrics(userId: string): Promise<void> {
  try {
    // Calculate averages from all metrics
    const { data, error } = await supabase
      .rpc('update_student_language_aggregate_metrics', { target_student_id: userId });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating aggregate metrics:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AnalysisRequest = await req.json();
    
    // Validate request
    if (!requestData.userId || !requestData.messages || !Array.isArray(requestData.messages)) {
      throw new Error("Invalid request format. Required fields: userId, messages[]");
    }
    
    // Analyze the conversation
    const analysisResult = await analyzeWithAI(requestData.messages);
    
    // Save the metrics if this is a real conversation (not just a test)
    if (requestData.userId !== 'test') {
      await saveMetrics(
        requestData.userId, 
        requestData.classroomId,
        requestData.sessionId,
        analysisResult
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        metrics: analysisResult
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in analyze-conversation-quality function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
