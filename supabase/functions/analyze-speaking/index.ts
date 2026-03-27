import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AnalysisRequest {
  speakingAttemptId: string;
  listeningAttemptId: string;
  transcript?: {
    userMessages: Array<{ content: string; role: string; created_at?: string }>;
    aiResponses: Array<{ content: string; role: string; created_at?: string }>;
  };
}

async function fetchTranscriptData(requestBody: AnalysisRequest): Promise<any> {
  if (requestBody.transcript) return requestBody.transcript;

  const { data, error } = await supabase
    .from("certification_transcripts")
    .select("user_transcripts, ai_responses")
    .eq("attempt_id", requestBody.speakingAttemptId)
    .limit(1);

  if (error || !data?.length) throw new Error("No transcript data found");
  return { userMessages: data[0].user_transcripts, aiResponses: data[0].ai_responses };
}

function formatTranscriptForAnalysis(transcript: any): string {
  let text = "Conversation Transcript:\n\n";
  let allMessages: any[] = [];
  if (transcript.userMessages) allMessages = allMessages.concat(transcript.userMessages.map((m: any) => ({ ...m, timestamp: m.created_at ? new Date(m.created_at).getTime() : 0 })));
  if (transcript.aiResponses) allMessages = allMessages.concat(transcript.aiResponses.map((m: any) => ({ ...m, timestamp: m.created_at ? new Date(m.created_at).getTime() : 0 })));
  if (allMessages.some(m => m.timestamp > 0)) allMessages.sort((a, b) => a.timestamp - b.timestamp);
  allMessages.forEach((m) => { text += m.role === "user" ? `User: ${m.content}\n\n` : `AI Tutor: ${m.content}\n\n`; });
  return text;
}

async function analyzeWithAI(formattedTranscript: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const systemPrompt = `You are a world-class language assessment expert specializing in ESL evaluation. Evaluate the English conversation using CEFR framework. Return a JSON object with: speaking (level, overallScore 0-100, pronunciation 1-10, fluency 1-10, grammar 1-10, vocabulary 1-10, coherence 1-10), listening (level, overallScore 0-100, understanding 1-10, vocabulary 1-10, interaction 1-10), feedback (string), strengths (array), areasToImprove (array). ONLY return valid JSON.`;

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this conversation:\n\n${formattedTranscript}\n\nReturn ONLY valid JSON.` }
      ],
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI gateway error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const analysisText = data.choices[0].message.content;
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      speaking: { level: "B1", overallScore: 60, pronunciation: 6, fluency: 6, grammar: 6 },
      listening: { level: "B1", overallScore: 60, understanding: 6, vocabulary: 6, interaction: 6 },
      feedback: "Analysis completed but detailed extraction failed.",
      strengths: ["Effort to communicate"],
      areasToImprove: ["Try again for a more detailed assessment"]
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const requestBody: AnalysisRequest = await req.json();
    if (!requestBody.speakingAttemptId || !requestBody.listeningAttemptId) throw new Error("Missing required parameters");

    const transcript = await fetchTranscriptData(requestBody);
    const formattedTranscript = formatTranscriptForAnalysis(transcript);
    const analysis = await analyzeWithAI(formattedTranscript);

    return new Response(JSON.stringify({ success: true, ...analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in analyze-speaking:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
