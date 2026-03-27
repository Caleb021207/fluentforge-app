import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const getRandomContext = () => {
  const contexts = ["daily conversation", "workplace scenario", "travel situation", "social interaction", "academic discussion", "casual chat", "formal meeting", "family gathering", "shopping experience", "restaurant visit", "transportation", "healthcare", "entertainment", "sports discussion", "weather talk", "hobby conversation"];
  return contexts[Math.floor(Math.random() * contexts.length)];
};

const getRandomStyle = () => {
  const styles = ["natural and conversational", "formal and polite", "casual and friendly", "enthusiastic and energetic", "calm and thoughtful", "practical and direct", "warm and welcoming", "professional and clear"];
  return styles[Math.floor(Math.random() * styles.length)];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { targetLanguage, level, nativeLanguage, timestamp } = await req.json();
    if (!targetLanguage || !level || !nativeLanguage) {
      return new Response(
        JSON.stringify({ error: "Target language, level, and native language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: recentPhrases } = await supabase
      .from('recent_phrases')
      .select('phrase')
      .eq('level', level)
      .eq('language', targetLanguage)
      .order('created_at', { ascending: false })
      .limit(15);

    const recentPhrasesText = recentPhrases?.map(p => p.phrase) || [];
    const levelInstructions: Record<string, string> = {
      "Novice": "basic expressions with simple vocabulary that a beginner would learn",
      "Intermediate": "everyday phrases with moderate vocabulary that an intermediate learner should practice",
      "Advanced": "complex sentences with more sophisticated vocabulary that an advanced learner would use",
      "Superior": "academically or professionally oriented content with specialized vocabulary"
    };
    const instruction = levelInstructions[level] || levelInstructions.Intermediate;
    const avoidanceInstruction = recentPhrasesText.length > 0
      ? `\n\nIMPORTANT: Avoid these recently used phrases: ${recentPhrasesText.join(', ')}`
      : '';

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a creative language learning assistant that generates unique pronunciation practice phrases." },
          { role: "user", content: `Generate ONE unique ${targetLanguage} phrase for pronunciation practice.\n\nREQUIREMENTS:\n- Level: ${instruction}\n- Context: ${getRandomContext()}\n- Style: ${getRandomStyle()}${avoidanceInstruction}\n\nReply with a JSON object: { "phrase": "...", "translation": "... in ${nativeLanguage}", "topic": "...", "level": "${level}" }\n\nONLY respond with JSON.` }
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI gateway error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/(\{[\s\S]*\})/);
    const generatedPhrase = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    // Store phrase in background
    supabase.from('recent_phrases').insert({ phrase: generatedPhrase.phrase, level, language: targetLanguage }).then(() => {});

    return new Response(JSON.stringify(generatedPhrase), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
