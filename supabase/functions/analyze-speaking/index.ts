
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("analyze-speaking function loaded");

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { userTranscripts, aiResponses } = requestData;

    console.log("Received request with transcripts:", 
      { 
        transcriptsCount: userTranscripts?.length || 0, 
        responsesCount: aiResponses?.length || 0 
      }
    );

    // Validate input
    if (!userTranscripts || !Array.isArray(userTranscripts) || userTranscripts.length === 0) {
      console.error("Invalid or empty user transcripts:", userTranscripts);
      return new Response(
        JSON.stringify({ error: "Invalid or empty user transcripts" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create service role client for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API key");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Prepare conversation data for OpenAI
    let conversationText = "";
    const maxMessages = Math.min(
      userTranscripts.length,
      aiResponses?.length || 0
    );

    for (let i = 0; i < maxMessages; i++) {
      conversationText += `User: ${userTranscripts[i]}\n`;
      conversationText += `AI: ${aiResponses[i]}\n\n`;
    }

    // If there are more user transcripts than AI responses
    if (userTranscripts.length > (aiResponses?.length || 0)) {
      conversationText += `User: ${userTranscripts[userTranscripts.length - 1]}\n`;
    }

    // Log conversation data being sent to OpenAI
    console.log("Sending conversation data to OpenAI:", { conversationLength: conversationText.length });

    // Prepare the prompt for GPT-4
    const prompt = `
    You are a Spanish language certification examiner. Analyze the following conversation between a student (User) and an AI Spanish tutor.

    CONVERSATION:
    ${conversationText}

    Assess the student's speaking and listening abilities in Spanish using the CEFR (Common European Framework of Reference for Languages) scale from A1 to C2.

    Evaluate for:

    1. Speaking ability: Pronunciation, grammar, vocabulary, fluency, coherence
    2. Listening comprehension: Understanding of questions, appropriate responses

    Provide:

    1. A speaking assessment with CEFR level (exact level: A1, A2, B1, B2, C1, or C2)
    2. A listening assessment with CEFR level (exact level: A1, A2, B1, B2, C1, or C2)
    3. A score for each (0-100)
    4. Detailed feedback with specific examples from the conversation

    Format your response as valid JSON with the following structure:
    {
      "speakingLevel": "B1", // must be one of: A1, A2, B1, B2, C1, C2
      "speakingScore": 75, // numeric score 0-100
      "listeningLevel": "B1", // must be one of: A1, A2, B1, B2, C1, C2
      "listeningScore": 70, // numeric score 0-100
      "analysis": "Detailed analysis text here..."
    }
    `;

    // Call OpenAI API for scoring
    console.log("Calling OpenAI API for assessment...");
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    // Parse OpenAI response
    const openAIData = await openAIResponse.json();
    console.log("Received response from OpenAI");

    if (!openAIResponse.ok) {
      console.error("OpenAI API error:", openAIData);
      return new Response(
        JSON.stringify({ error: "Error analyzing conversation", details: openAIData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extract and parse the response
    const responseContent = openAIData.choices[0]?.message?.content;
    console.log("OpenAI response content:", responseContent);

    if (!responseContent) {
      console.error("Empty response from OpenAI");
      return new Response(
        JSON.stringify({ error: "Empty analysis result" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extract JSON from response (in case there's text before/after the JSON)
    let jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Could not find JSON in response");
      // Default scores if parsing fails
      return new Response(
        JSON.stringify({
          speakingLevel: "B1",
          speakingScore: 70,
          listeningLevel: "B1",
          listeningScore: 70,
          analysis: "Unable to analyze the conversation properly. The system encountered an error while processing your test. Default scores have been assigned."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      // Parse the JSON result
      const analysisResult = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed analysis result:", analysisResult);

      // Validate and enforce the CEFR levels
      const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      
      // Ensure speaking level is valid
      if (!validLevels.includes(analysisResult.speakingLevel)) {
        console.warn(`Invalid speaking level: ${analysisResult.speakingLevel}, defaulting to B1`);
        analysisResult.speakingLevel = "B1";
      }
      
      // Ensure listening level is valid
      if (!validLevels.includes(analysisResult.listeningLevel)) {
        console.warn(`Invalid listening level: ${analysisResult.listeningLevel}, defaulting to B1`);
        analysisResult.listeningLevel = "B1";
      }
      
      // Ensure scores are numbers between 0-100
      if (typeof analysisResult.speakingScore !== 'number' || 
          analysisResult.speakingScore < 0 || 
          analysisResult.speakingScore > 100) {
        console.warn(`Invalid speaking score: ${analysisResult.speakingScore}, defaulting to 70`);
        analysisResult.speakingScore = 70;
      }
      
      if (typeof analysisResult.listeningScore !== 'number' || 
          analysisResult.listeningScore < 0 || 
          analysisResult.listeningScore > 100) {
        console.warn(`Invalid listening score: ${analysisResult.listeningScore}, defaulting to 70`);
        analysisResult.listeningScore = 70;
      }
      
      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error parsing JSON from OpenAI response:", error);
      // Default scores if parsing fails
      return new Response(
        JSON.stringify({
          speakingLevel: "B1",
          speakingScore: 70,
          listeningLevel: "B1",
          listeningScore: 70,
          analysis: "Unable to analyze the conversation properly. The system encountered an error while processing your test. Default scores have been assigned."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
