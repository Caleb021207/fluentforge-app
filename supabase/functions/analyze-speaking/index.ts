
import { serve } from "http/server";
import OpenAI from "openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variable
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          speakingLevel: "B1",
          speakingScore: 70,
          listeningLevel: "B1",
          listeningScore: 70,
          analysis: "Unable to analyze conversation due to configuration issue. Using default assessment levels."
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Parse request body
    const requestData = await req.json();
    console.log("Request received with data:", JSON.stringify(requestData, null, 2));

    const { userTranscripts = [], aiResponses = [] } = requestData;

    console.log(`Received ${userTranscripts.length} user transcripts and ${aiResponses.length} AI responses`);
    
    // Check if we have meaningful data to analyze
    if ((!userTranscripts || userTranscripts.length === 0) && 
        (!aiResponses || aiResponses.length === 0)) {
      console.warn("No conversation data to analyze, returning default assessment");
      return new Response(
        JSON.stringify({
          error: "No conversation data provided",
          speakingLevel: "B1",
          speakingScore: 70,
          listeningLevel: "B1", 
          listeningScore: 70,
          analysis: "Unable to analyze conversation due to missing data. Using default assessment levels."
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Format conversation for OpenAI
    console.log("Formatting conversation for analysis...");
    const conversation = [];
    let maxIndex = Math.max(userTranscripts.length, aiResponses.length);
    
    for (let i = 0; i < maxIndex; i++) {
      if (aiResponses[i]) {
        conversation.push({ role: "system", content: aiResponses[i] });
      }
      if (userTranscripts[i]) {
        conversation.push({ role: "user", content: userTranscripts[i] });
      }
    }

    console.log("Formatted conversation:", JSON.stringify(conversation.slice(0, 2), null, 2) + 
      (conversation.length > 2 ? `... and ${conversation.length - 2} more messages` : ""));

    // Define the analysis prompt
    const analyzePrompt = `
      Analyze the following Spanish language conversation to assess the user's speaking and listening skills:
      
      ${conversation.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}
      
      Provide a separate evaluation for SPEAKING and LISTENING skills using the CEFR framework (A1, A2, B1, B2, C1, C2).
      For each skill, assign both a CEFR level and a numerical score from 0-100.
      Then provide a detailed analysis of the user's language abilities.
      
      Format your response exactly as JSON with these fields:
      {
        "speakingLevel": "CEFR level (A1-C2)",
        "speakingScore": numerical score (0-100),
        "listeningLevel": "CEFR level (A1-C2)",
        "listeningScore": numerical score (0-100),
        "analysis": "detailed feedback and observations"
      }
    `;

    console.log("Sending analysis request to OpenAI...");
    // Call OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a Spanish language assessment expert. Analyze conversations to evaluate language proficiency using CEFR framework." 
        },
        { 
          role: "user", 
          content: analyzePrompt 
        }
      ],
      temperature: 0.2,
    });

    console.log("OpenAI response received");
    
    // Parse OpenAI response
    const analysisText = response.choices[0]?.message?.content?.trim() || "";
    console.log("Raw analysis text:", analysisText);
    
    let assessmentData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      assessmentData = JSON.parse(jsonString);
      
      console.log("Parsed assessment data:", assessmentData);
      
      // Validate the required fields
      const requiredFields = ['speakingLevel', 'speakingScore', 'listeningLevel', 'listeningScore', 'analysis'];
      const missingFields = requiredFields.filter(field => !assessmentData[field]);
      
      if (missingFields.length > 0) {
        console.warn(`Missing fields in assessment data: ${missingFields.join(', ')}`);
        // Add default values for missing fields
        missingFields.forEach(field => {
          if (field.includes('Level')) {
            assessmentData[field] = 'B1';
          } else if (field.includes('Score')) {
            assessmentData[field] = 70;
          } else if (field === 'analysis') {
            assessmentData[field] = "Analysis not provided by the model. Please review the conversation.";
          }
        });
      }
    } catch (error) {
      console.error("Error parsing assessment data:", error);
      console.error("OpenAI response was:", analysisText);
      
      // Provide fallback data
      assessmentData = {
        speakingLevel: "B1",
        speakingScore: 70,
        listeningLevel: "B1",
        listeningScore: 70,
        analysis: "Unable to analyze conversation due to data processing error. Using default assessment levels."
      };
    }

    console.log("Final assessment data:", assessmentData);
    
    // Return assessment result
    return new Response(
      JSON.stringify(assessmentData),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return error with fallback assessment
    return new Response(
      JSON.stringify({
        error: error.message,
        speakingLevel: "B1",
        speakingScore: 70,
        listeningLevel: "B1",
        listeningScore: 70,
        analysis: "An error occurred during assessment. Using default assessment levels."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
