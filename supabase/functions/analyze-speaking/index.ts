
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
  let allMessages: any[] = [];
  
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

// Analyze the conversation transcript using GPT
async function analyzeWithGPT(formattedTranscript: string): Promise<any> {
  // Create comprehensive prompt for GPT-5
  const systemPrompt = `
    You are a world-class language assessment expert specializing in English as a Second Language (ESL) evaluation. 
    Your analysis must be thorough, insightful, and actionable - this is a premium feature that learners rely on for detailed feedback.
    
    Evaluate the English conversation between a learner and an AI tutor using the CEFR framework with maximum depth and specificity.
    
    EVALUATION DIMENSIONS:
    
    1. SPEAKING SKILLS:
       - Pronunciation: Sound accuracy, stress patterns, intonation, rhythm
       - Fluency: Speech rate, hesitations, self-corrections, discourse markers
       - Grammar: Accuracy, complexity, range of structures, error patterns
       - Vocabulary: Range, sophistication, collocations, topic-specific lexis
       - Coherence: Logical flow, linking words, paragraph structure
       
    2. LISTENING SKILLS:
       - Comprehension: Understanding questions, following conversation flow
       - Response appropriateness: Relevance, depth, context awareness
       - Vocabulary recognition: Understanding varied lexical items
       
    3. DETAILED ANALYSIS REQUIREMENTS:
       - Identify specific grammar patterns (both strong and weak)
       - Note sophisticated vocabulary with examples from transcript
       - Highlight discourse strategies used
       - Identify pronunciation patterns from transcription
       - Compare performance against CEFR descriptors with specific examples
       - Provide concrete examples from the transcript for every claim
    
    CEFR SCORING GUIDELINES (be generous but accurate):
    - A1 (0-30%): Memorized phrases, very basic vocabulary
    - A2 (31-49%): Simple sentences about immediate needs
    - B1 (50-65%): Connected discourse on familiar topics
    - B2 (66-80%): Detailed discourse, abstract topics, fluency
    - C1 (81-95%): Sophisticated vocabulary, complex structures, minimal errors
    - C2 (96-100%): Near-native precision and fluency
    
    IMPORTANT: Complex topic discussion (technology, philosophy, science) indicates B2+ minimum.
    PRIORITIZE: Content depth and communicative effectiveness over grammatical perfection.
  `;
  
  const userPrompt = `
    Provide an extremely detailed analysis of this conversation transcript. This is a premium analysis feature.
    
    ${formattedTranscript}
    
    Return a comprehensive JSON object with this EXACT structure:
    {
      "speaking": {
        "level": "[CEFR level]",
        "overallScore": [0-100],
        "pronunciation": [1-10],
        "fluency": [1-10],
        "grammar": [1-10],
        "vocabulary": [1-10],
        "coherence": [1-10]
      },
      "listening": {
        "level": "[CEFR level]",
        "overallScore": [0-100],
        "understanding": [1-10],
        "vocabulary": [1-10],
        "interaction": [1-10]
      },
      "detailedAnalysis": {
        "grammarAnalysis": {
          "strengths": ["specific pattern 1 with example", "pattern 2", "pattern 3"],
          "weaknesses": ["specific error pattern 1", "error 2", "error 3"],
          "examples": ["direct quote showing strength", "quote showing error"],
          "recommendations": ["specific grammar focus area 1", "area 2"]
        },
        "vocabularyAnalysis": {
          "level": "[description of vocabulary sophistication]",
          "range": ["topic area 1", "topic area 2", "topic area 3"],
          "sophisticatedTerms": ["advanced word/phrase 1", "term 2", "term 3"],
          "collocations": ["natural collocation 1", "collocation 2"],
          "recommendations": ["vocabulary expansion area 1", "area 2"]
        },
        "pronunciationAnalysis": {
          "strengths": ["phonological strength 1", "strength 2"],
          "challenges": ["pronunciation challenge 1", "challenge 2"],
          "intonationPatterns": "[description of prosody]",
          "recommendations": ["specific pronunciation focus 1", "focus 2"]
        },
        "fluencyAnalysis": {
          "speechRate": "[description: slow/moderate/natural/fast]",
          "hesitationPatterns": ["observed hesitation 1", "pattern 2"],
          "discourseMarkers": ["used marker 1", "marker 2", "marker 3"],
          "selfCorrections": "[frequency and handling of self-corrections]",
          "recommendations": ["fluency improvement 1", "improvement 2"]
        },
        "coherenceAnalysis": {
          "organization": "[how well ideas are structured]",
          "linkingDevices": ["linking word/phrase 1", "device 2"],
          "topicDevelopment": "[how topics are developed and sustained]",
          "recommendations": ["coherence improvement 1", "improvement 2"]
        }
      },
      "cefrComparison": {
        "currentLevel": "[CEFR]",
        "descriptorMatch": "[explain how performance matches CEFR descriptors]",
        "strengthsVsLevel": ["how they exceed current level 1", "area 2"],
        "gapsToNextLevel": ["specific gap 1", "gap 2", "gap 3"],
        "estimatedTimeToNextLevel": "[realistic time estimate with practice]"
      },
      "feedback": "[3-4 paragraph comprehensive feedback covering overall performance, key patterns, and growth trajectory]",
      "strengths": ["specific strength 1 with example", "strength 2", "strength 3", "strength 4", "strength 5"],
      "areasToImprove": ["specific area 1 with context", "area 2", "area 3", "area 4"],
      "learningPathway": {
        "immediateGoals": ["actionable goal 1", "goal 2", "goal 3"],
        "mediumTermGoals": ["3-month goal 1", "goal 2"],
        "practiceActivities": [
          {"activity": "specific activity 1", "focus": "skill it develops", "frequency": "recommended frequency"},
          {"activity": "activity 2", "focus": "skill", "frequency": "frequency"},
          {"activity": "activity 3", "focus": "skill", "frequency": "frequency"}
        ],
        "resourceRecommendations": ["resource type 1", "resource 2", "resource 3"]
      },
      "progressIndicators": {
        "recentImprovements": ["improvement 1 if visible", "improvement 2"],
        "consistentStrengths": ["consistent strength 1", "strength 2"],
        "emergingSkills": ["developing skill 1", "skill 2"],
        "priorityAreas": ["most important focus area 1", "area 2"]
      }
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
        model: "gpt-5-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 4000
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
      console.log("GPT Analysis results:", analysis);
      
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
          overallScore: 60,
          pronunciation: 6,
          fluency: 6,
          grammar: 6
        },
        listening: {
          level: "B1",
          overallScore: 60,
          understanding: 6,
          vocabulary: 6,
          interaction: 6
        },
        feedback: "The system could not properly analyze your conversation. Please try again later.",
        strengths: ["Effort to communicate in English"],
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
    
    // Format transcript for GPT analysis
    const formattedTranscript = formatTranscriptForAnalysis(transcript);
    
    // Analyze with GPT directly (no algorithmic fallback)
    const analysis = await analyzeWithGPT(formattedTranscript);
    console.log("GPT analysis complete");
    
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
