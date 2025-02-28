import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Access OpenAI API key from environment variables
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") as string;

// Define an interface for the request body
interface AnalysisRequest {
  speakingAttemptId: string;
  listeningAttemptId: string;
  transcript?: {
    userMessages: Array<{
      content: string;
      role: string;
      created_at?: string;
    }>;
    aiResponses: Array<{
      content: string;
      role: string;
      created_at?: string;
    }>;
  };
}

// Define an interface for the response
interface AnalysisResponse {
  speaking: {
    level: string;
    overallScore: number;
    pronunciation: number;
    fluency: number;
    grammar: number;
  };
  listening: {
    level: string;
    overallScore: number;
    understanding: number;
    vocabulary: number;
    interaction: number;
  };
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
}

// Fetch the transcript data from the database
async function fetchTranscriptData(requestBody: AnalysisRequest): Promise<any> {
  // If transcript data is included in the request body, use it directly
  if (requestBody.transcript) {
    console.log("Using transcript data from request body");
    return {
      userMessages: requestBody.transcript.userMessages,
      aiResponses: requestBody.transcript.aiResponses
    };
  }

  // Otherwise, try to fetch from the database
  console.log("Fetching transcript data from database for attempt:", requestBody.speakingAttemptId);
  const { data, error } = await supabase
    .from("certification_transcripts")
    .select("user_transcripts, ai_responses")
    .eq("attempt_id", requestBody.speakingAttemptId)
    .limit(1);

  if (error) {
    console.error("Error fetching transcript:", error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error("No transcript found for attempt:", requestBody.speakingAttemptId);
    throw new Error("No transcript data found");
  }

  return {
    userMessages: data[0].user_transcripts,
    aiResponses: data[0].ai_responses
  };
}

// Function to format transcript data for analysis
function formatTranscriptForAnalysis(transcript: any): string {
  let formattedText = "Conversation Transcript:\n\n";
  
  // Merge and sort all messages by timestamp if available
  let allMessages = [];
  
  if (transcript.userMessages && Array.isArray(transcript.userMessages)) {
    allMessages = allMessages.concat(
      transcript.userMessages.map((m: any) => ({
        ...m,
        timestamp: m.created_at ? new Date(m.created_at).getTime() : 0
      }))
    );
  }
  
  if (transcript.aiResponses && Array.isArray(transcript.aiResponses)) {
    allMessages = allMessages.concat(
      transcript.aiResponses.map((m: any) => ({
        ...m,
        timestamp: m.created_at ? new Date(m.created_at).getTime() : 0
      }))
    );
  }
  
  // Sort by timestamp if available
  if (allMessages.some(m => m.timestamp > 0)) {
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  // Format the conversation
  allMessages.forEach((message) => {
    if (message.role === "user") {
      formattedText += `User: ${message.content}\n\n`;
    } else if (message.role === "assistant") {
      formattedText += `AI Tutor: ${message.content}\n\n`;
    }
  });
  
  return formattedText;
}

// Function to analyze speaking and listening abilities
async function analyzeConversation(transcript: any): Promise<AnalysisResponse> {
  const formattedTranscript = formatTranscriptForAnalysis(transcript);
  
  console.log("Formatted transcript prepared for analysis");
  
  // Create prompt for GPT
  const systemPrompt = `
    You are an expert language examiner for Spanish. You need to evaluate a Spanish conversation between a user (language student) and an AI tutor.
    Assess both the user's speaking and listening abilities based on the transcript.
    
    For speaking evaluation, focus on:
    1. Pronunciation (accuracy, comprehensibility)
    2. Fluency (flow, hesitation, naturalness)
    3. Grammar (accuracy, complexity)
    
    For listening evaluation, focus on:
    1. Understanding (comprehension of AI tutor's questions/statements)
    2. Vocabulary recognition (ability to understand different words/phrases)
    3. Interaction quality (appropriate responses showing comprehension)
    
    Provide separate CEFR level assessments (A1, A2, B1, B2, C1, or C2) for both speaking and listening skills.
    Also convert each CEFR level to a 0-100 score where:
    - A1: 0-16
    - A2: 17-33
    - B1: 34-50
    - B2: 51-67
    - C1: 68-84
    - C2: 85-100
    
    For each skill (pronunciation, fluency, etc.), provide a score from 1-10.
  `;
  
  const userPrompt = `
    Please analyze this Spanish conversation transcript and provide a detailed assessment.
    
    ${formattedTranscript}
    
    Format your response strictly as a JSON object with the following structure:
    {
      "speaking": {
        "level": "[CEFR level]",
        "overallScore": [0-100 score],
        "pronunciation": [1-10 score],
        "fluency": [1-10 score],
        "grammar": [1-10 score]
      },
      "listening": {
        "level": "[CEFR level]",
        "overallScore": [0-100 score],
        "understanding": [1-10 score],
        "vocabulary": [1-10 score],
        "interaction": [1-10 score]
      },
      "feedback": "[Overall feedback on the user's performance]",
      "strengths": ["strength1", "strength2", "strength3"],
      "areasToImprove": ["area1", "area2", "area3"]
    }
  `;

  // Call OpenAI API for analysis
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from OpenAI response");
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      console.log("Analysis results:", analysis);
      
      // Ensure overallScore is a number
      if (typeof analysis.speaking.overallScore === 'string') {
        analysis.speaking.overallScore = parseInt(analysis.speaking.overallScore);
      }
      if (typeof analysis.listening.overallScore === 'string') {
        analysis.listening.overallScore = parseInt(analysis.listening.overallScore);
      }
      
      return analysis;
    } catch (parseError) {
      console.error("Error parsing analysis results:", parseError);
      console.log("Raw analysis text:", analysisText);
      
      // Provide a default response if parsing fails
      return {
        speaking: {
          level: "B1",
          overallScore: 45,
          pronunciation: 5,
          fluency: 5,
          grammar: 5
        },
        listening: {
          level: "B1",
          overallScore: 45,
          understanding: 5,
          vocabulary: 5,
          interaction: 5
        },
        feedback: "The system could not properly analyze your conversation. Please try again later.",
        strengths: ["Effort to communicate in Spanish"],
        areasToImprove: ["Try again for a more detailed assessment"]
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestBody: AnalysisRequest = await req.json();
    console.log("Received analysis request:", requestBody);
    
    // Validate request
    if (!requestBody.speakingAttemptId || !requestBody.listeningAttemptId) {
      throw new Error("Missing required parameters: speakingAttemptId and listeningAttemptId");
    }

    // Fetch transcript data
    const transcript = await fetchTranscriptData(requestBody);
    console.log("Transcript data retrieved for analysis");
    
    // Analyze the conversation
    const analysis = await analyzeConversation(transcript);
    console.log("Conversation analysis complete");
    
    // Prepare the response
    const responseObj = {
      success: true,
      ...analysis
    };

    return new Response(JSON.stringify(responseObj), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in analyze-speaking function:", error);
    
    // Return a proper error response
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
