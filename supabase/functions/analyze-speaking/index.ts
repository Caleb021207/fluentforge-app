
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { attemptId } = await req.json();

    if (!attemptId) {
      throw new Error("Missing required parameter: attemptId");
    }

    // Fetch the certification attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from("certification_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (attemptError) {
      throw new Error(`Failed to fetch certification attempt: ${attemptError.message}`);
    }

    // Get the conversation history from ElevenLabs
    // Since ElevenLabs stores the transcripts when auto-deletion is off,
    // we need to fetch them using the ElevenLabs API

    // For now, we'll simulate this with a placeholder
    // In production, you would integrate with ElevenLabs API to get actual transcript data
    // This would be based on a conversation ID that you'd need to store when starting the test

    // Placeholder transcript data
    const mockTranscript = {
      userMessages: [
        "Hola, ¿cómo estás?",
        "Me llamo Juan y soy de los Estados Unidos.",
        "Me gusta viajar y aprender nuevos idiomas.",
        "Ayer fui al restaurante con mis amigos y comimos paella.",
        "No entiendo esa pregunta, ¿puedes repetirla?",
      ],
      aiMessages: [
        "Hola, estoy bien. ¿Y tú? ¿Cómo te llamas y de dónde eres?",
        "Encantado de conocerte, Juan. ¿Tienes algún pasatiempo o interés especial?",
        "¡Qué interesante! Viajar es una excelente manera de practicar idiomas. ¿Has hecho algo interesante últimamente?",
        "La paella es deliciosa. ¿Te gusta la comida española? ¿Qué otros platos has probado?",
        "Claro, te preguntaba qué otros platos de la cocina española has probado además de la paella.",
      ],
    };

    // In a real implementation, save the actual transcript to the database
    const { data: transcript, error: transcriptError } = await supabase
      .from("certification_transcripts")
      .insert({
        attempt_id: attemptId,
        user_id: attempt.user_id,
        user_transcripts: mockTranscript.userMessages,
        ai_responses: mockTranscript.aiMessages,
      })
      .select()
      .single();

    if (transcriptError) {
      throw new Error(`Failed to save transcript: ${transcriptError.message}`);
    }

    // Analyze the conversation using GPT-4
    // Create a prompt that instructs GPT to analyze the Spanish conversation
    const fullTranscript = mockTranscript.userMessages.map((msg, i) => {
      return {
        user: msg,
        ai: mockTranscript.aiMessages[i] || "",
      };
    });

    const analysisPrompt = `
You are an expert Spanish language assessor. Analyze the following conversation between an AI tutor and a language learner.
Focus on the learner's Spanish language skills only.

CONVERSATION:
${fullTranscript.map(t => `USER: ${t.user}\nAI TUTOR: ${t.ai}`).join('\n\n')}

Assess the learner's Spanish conversational fluency using the following criteria:
1. Pronunciation (0-10): How accurately they pronounce Spanish words
2. Fluency (0-10): How smoothly they speak without hesitation
3. Grammar (0-10): How correctly they use Spanish grammar
4. Vocabulary (0-10): Range and appropriateness of vocabulary
5. Understanding (0-10): How well they understand the AI tutor
6. Interaction (0-10): How effectively they maintain conversation flow

Calculate an overall score (0-100) that represents their conversational Spanish proficiency.

Provide a brief analysis of their strengths (list 3-4 specific strengths).
Provide a brief analysis of areas to improve (list 3-4 specific areas).
Finally, provide a 2-3 sentence personalized feedback summary.

Format your response EXACTLY as a JSON object with the following structure:
{
  "pronunciation": <score>,
  "fluency": <score>,
  "grammar": <score>,
  "vocabulary": <score>,
  "understanding": <score>,
  "interaction": <score>,
  "overallScore": <overall percentage score>,
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "feedback": "Personalized feedback paragraph"
}
`;

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert Spanish language assessor that analyzes conversations and provides detailed feedback on language proficiency.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API Error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const analysisResult = JSON.parse(openaiData.choices[0].message.content);

    // Save the analysis data
    const { error: analysisError } = await supabase
      .from("certification_transcripts")
      .update({
        analysis_data: analysisResult,
      })
      .eq("id", transcript.id);

    if (analysisError) {
      throw new Error(`Failed to save analysis: ${analysisError.message}`);
    }

    // Return the analysis results
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in analyze-speaking function:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
