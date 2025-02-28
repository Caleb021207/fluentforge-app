
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to determine CEFR level based on score
function determineLevel(score: number): string {
  if (score >= 84) return 'C2';
  if (score >= 67) return 'C1';
  if (score >= 50) return 'B2';
  if (score >= 33) return 'B1';
  if (score >= 17) return 'A2';
  return 'A1';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { userTranscripts, aiResponses } = await req.json();
    
    console.log("Received user transcripts:", userTranscripts);
    console.log("Received AI responses:", aiResponses);

    // Check if we have conversation data to analyze
    if ((!userTranscripts || userTranscripts.length === 0) && (!aiResponses || aiResponses.length === 0)) {
      console.log("No conversation data provided");
      return new Response(
        JSON.stringify({
          error: "No conversation data provided",
          speakingLevel: "B1",
          speakingScore: 50,
          listeningLevel: "B1",
          listeningScore: 50,
          analysis: "Unable to analyze as no conversation was detected. Please try again."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine all user utterances and AI responses for analysis
    const userText = userTranscripts && userTranscripts.length > 0 ? userTranscripts.join('\n') : "No user speech detected";
    const aiText = aiResponses && aiResponses.length > 0 ? aiResponses.join('\n') : "No AI responses detected";
    
    console.log("Combined user text:", userText);
    console.log("Combined AI text:", aiText);

    // If no OpenAI API key, provide a fallback analysis
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured");
      
      // Generate simple scores based on text length as a fallback
      const speakingScore = Math.min(100, Math.max(10, userText.length / 10));
      const listeningScore = Math.min(100, Math.max(10, (userText.length + aiText.length) / 20));
      
      const speakingLevel = determineLevel(speakingScore);
      const listeningLevel = determineLevel(listeningScore);
      
      return new Response(
        JSON.stringify({
          speakingLevel,
          speakingScore: Math.round(speakingScore),
          listeningLevel,
          listeningScore: Math.round(listeningScore),
          analysis: "Automated analysis based on conversation length. For more detailed analysis, please configure the OpenAI API key."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the conversation for the OpenAI API
    const fullConversation = [];
    
    // Build alternating conversation if possible
    if (aiResponses && aiResponses.length > 0 && userTranscripts && userTranscripts.length > 0) {
      // Determine the max number of turns
      const maxTurns = Math.max(aiResponses.length, userTranscripts.length);
      
      for (let i = 0; i < maxTurns; i++) {
        if (aiResponses[i]) {
          fullConversation.push(`AI: ${aiResponses[i]}`);
        }
        if (userTranscripts[i]) {
          fullConversation.push(`User: ${userTranscripts[i]}`);
        }
      }
    } else {
      // Fallback if we only have one side of the conversation
      if (aiResponses && aiResponses.length > 0) {
        aiResponses.forEach((response, i) => {
          fullConversation.push(`AI: ${response}`);
        });
      }
      if (userTranscripts && userTranscripts.length > 0) {
        userTranscripts.forEach((transcript, i) => {
          fullConversation.push(`User: ${transcript}`);
        });
      }
    }
    
    const conversationText = fullConversation.join('\n\n');
    console.log("Prepared conversation for analysis:", conversationText);

    // Analyze the conversation using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
              You are an expert language proficiency assessor for Spanish language skills. 
              Analyze the provided conversation between a Spanish AI tutor and a student.
              
              Evaluate the student's Spanish proficiency in two areas:
              1. Speaking skills (grammar, vocabulary, fluency, pronunciation as reflected in their word choices)
              2. Listening comprehension (how well they understood and responded to the AI's questions)
              
              Provide:
              1. A speaking score (0-100)
              2. A CEFR speaking level (A1, A2, B1, B2, C1, C2)
              3. A listening score (0-100)
              4. A CEFR listening level (A1, A2, B1, B2, C1, C2)
              5. A detailed analysis of strengths and weaknesses
              
              CEFR level scoring:
              - A1 (Beginner): 0-16
              - A2 (Elementary): 17-32
              - B1 (Intermediate): 33-49
              - B2 (Upper Intermediate): 50-66
              - C1 (Advanced): 67-83
              - C2 (Proficiency): 84-100
              
              Format your response as a JSON object:
              {
                "speakingScore": number,
                "speakingLevel": "A1|A2|B1|B2|C1|C2",
                "listeningScore": number,
                "listeningLevel": "A1|A2|B1|B2|C1|C2",
                "analysis": "detailed feedback text"
              }
              
              Return ONLY the JSON object, no other text.
            `
          },
          {
            role: 'user',
            content: `Here is the conversation to analyze:\n\n${conversationText}`
          }
        ],
        temperature: 0.2, // Lower temperature for more consistent results
      }),
    });

    // Parse the GPT response
    const gptData = await response.json();
    console.log("GPT API Response:", JSON.stringify(gptData));
    
    if (!gptData.choices || gptData.choices.length === 0) {
      throw new Error("Invalid response from OpenAI API");
    }

    const analysisText = gptData.choices[0].message.content;
    console.log("Analysis text:", analysisText);
    
    // Parse the JSON response
    try {
      // Try to parse the JSON directly
      const analysisData = JSON.parse(analysisText);
      console.log("Parsed analysis data:", analysisData);
      
      // Return the analysis data with CORS headers
      return new Response(
        JSON.stringify(analysisData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing GPT response as JSON:", parseError);
      
      // Fallback to extracting scores with regex if JSON parsing fails
      const speakingScoreMatch = analysisText.match(/speakingScore"?\s*:\s*(\d+)/);
      const speakingLevelMatch = analysisText.match(/speakingLevel"?\s*:\s*"([A-C][1-2])"/);
      const listeningScoreMatch = analysisText.match(/listeningScore"?\s*:\s*(\d+)/);
      const listeningLevelMatch = analysisText.match(/listeningLevel"?\s*:\s*"([A-C][1-2])"/);
      
      const speakingScore = speakingScoreMatch ? parseInt(speakingScoreMatch[1]) : 50;
      const speakingLevel = speakingLevelMatch ? speakingLevelMatch[1] : determineLevel(speakingScore);
      const listeningScore = listeningScoreMatch ? parseInt(listeningScoreMatch[1]) : 50;
      const listeningLevel = listeningLevelMatch ? listeningLevelMatch[1] : determineLevel(listeningScore);
      
      return new Response(
        JSON.stringify({
          speakingScore,
          speakingLevel,
          listeningScore,
          listeningLevel,
          analysis: analysisText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in analyze-speaking function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        speakingLevel: "B1",
        speakingScore: 50,
        listeningLevel: "B1",
        listeningScore: 50,
        analysis: "An error occurred during analysis. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
