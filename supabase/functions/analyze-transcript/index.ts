
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { transcript, prompt } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    console.log("Received transcript for analysis:", transcript.substring(0, 100) + "...");
    
    // The system prompt that guides the AI's analysis
    const systemPrompt = `
      You are an expert Spanish language assessor. Analyze the provided Spanish transcript and evaluate it based on:
      1. Fluency - How naturally the language flows
      2. Vocabulary - Range and appropriateness of vocabulary
      3. Grammar - Correctness of grammatical structures
      4. Coherence - How well ideas connect
      5. Pronunciation (inferred from transcription errors)
      
      Determine the CEFR level (A1, A2, B1, B2, C1, or C2) based on this analysis.
      
      Provide your response in the following JSON format:
      {
        "assessment": {
          "fluency": {
            "score": <number between 1-10>,
            "comments": "<brief assessment>"
          },
          "vocabulary": {
            "score": <number between 1-10>,
            "comments": "<brief assessment>"
          },
          "grammar": {
            "score": <number between 1-10>,
            "comments": "<brief assessment>"
          },
          "coherence": {
            "score": <number between 1-10>,
            "comments": "<brief assessment>"
          },
          "pronunciation": {
            "score": <number between 1-10>,
            "comments": "<brief assessment>"
          }
        },
        "overallScore": <number between 1-10>,
        "cefrLevel": "<A1, A2, B1, B2, C1, or C2>",
        "strengths": ["<strength1>", "<strength2>", ...],
        "areasForImprovement": ["<area1>", "<area2>", ...],
        "feedbackSummary": "<brief overall feedback in English>"
      }

      The response must be valid JSON without any additional text.
    `;

    // Construct messages for the API call
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is the Spanish transcript to analyze: "${transcript}"${prompt ? `\nThe prompt was: "${prompt}"` : ''}` }
    ];

    console.log("Sending to OpenAI for analysis...");

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Analysis completed successfully");

    // Extract the content from the response
    const analysisJson = result.choices[0].message.content;
    
    try {
      // Verify it's valid JSON
      const analysis = JSON.parse(analysisJson);
      
      // Store the result in the database here if needed
      // This would be a good place to save the assessment to the user's profile

      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      throw new Error("Failed to parse assessment results");
    }

  } catch (error) {
    console.error("Error in analyze-transcript function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
