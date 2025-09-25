import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Variety enhancement techniques
const getRandomContext = () => {
  const contexts = [
    "daily conversation", "workplace scenario", "travel situation", "social interaction",
    "academic discussion", "casual chat", "formal meeting", "family gathering",
    "shopping experience", "restaurant visit", "transportation", "healthcare",
    "entertainment", "sports discussion", "weather talk", "hobby conversation"
  ];
  return contexts[Math.floor(Math.random() * contexts.length)];
};

const getRandomStyle = () => {
  const styles = [
    "natural and conversational", "formal and polite", "casual and friendly",
    "enthusiastic and energetic", "calm and thoughtful", "practical and direct",
    "warm and welcoming", "professional and clear"
  ];
  return styles[Math.floor(Math.random() * styles.length)];
};

const getTimeBasedSeed = () => {
  const now = new Date();
  return now.getHours() + now.getMinutes() + now.getSeconds() + now.getMilliseconds();
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetLanguage, level, nativeLanguage, timestamp } = await req.json();
    console.log(`Generating ${level} phrase for ${targetLanguage} at ${timestamp}`);
    
    if (!targetLanguage || !level || !nativeLanguage) {
      return new Response(
        JSON.stringify({ error: "Target language, level, and native language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recent phrases for this level/language combination
    const { data: recentPhrases, error: dbError } = await supabase
      .from('recent_phrases')
      .select('phrase')
      .eq('level', level)
      .eq('language', targetLanguage)
      .order('created_at', { ascending: false })
      .limit(15);

    if (dbError) {
      console.error("Error fetching recent phrases:", dbError);
    }

    const recentPhrasesText = recentPhrases?.map(p => p.phrase) || [];
    console.log(`Found ${recentPhrasesText.length} recent phrases for ${level} ${targetLanguage}`);

    // Map complexity levels to appropriate instructions
    const levelInstructions = {
      "Novice": "basic expressions with simple vocabulary that a beginner would learn",
      "Intermediate": "everyday phrases with moderate vocabulary that an intermediate learner should practice",
      "Advanced": "complex sentences with more sophisticated vocabulary that an advanced learner would use",
      "Superior": "academically or professionally oriented content with specialized vocabulary"
    };

    const instruction = (levelInstructions as any)[level] || levelInstructions.Intermediate;
    
    // Enhanced variety techniques
    const randomContext = getRandomContext();
    const randomStyle = getRandomStyle();
    const timeSeed = getTimeBasedSeed();
    
    // Build avoidance instruction if we have recent phrases
    const avoidanceInstruction = recentPhrasesText.length > 0 
      ? `\n\nIMPORTANT: Avoid generating any of these recently used phrases: ${recentPhrasesText.join(', ')}`
      : '';

    let attempts = 0;
    const maxAttempts = 3;
    let generatedPhrase = null;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Generation attempt ${attempts}`);

      // Generate phrase using OpenAI with enhanced variety
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: `You are a creative language learning assistant that generates unique pronunciation practice phrases. 
                       Your goal is to create maximum variety and avoid repetition. Use different topics, scenarios, 
                       and linguistic structures each time. Be creative and unpredictable while maintaining appropriateness.`
            },
            {
              role: "user",
              content: `Generate ONE completely unique ${targetLanguage} phrase for pronunciation practice.

REQUIREMENTS:
- Level: ${instruction}
- Context: ${randomContext}
- Style: ${randomStyle}
- Uniqueness seed: ${timeSeed}
- Make it completely different from any typical language learning phrases
- Use creative vocabulary and sentence structures
- Ensure cultural appropriateness${avoidanceInstruction}

Reply with a JSON object having these properties:
1. phrase: The ${targetLanguage} phrase to practice
2. translation: The translation of the phrase in ${nativeLanguage}
3. topic: A short category/topic label
4. level: "${level}"

ONLY respond with the JSON. No explanations or additional text.`
            }
          ],
          temperature: 0.9, // Increased for more creativity
          max_tokens: 200,
          presence_penalty: 0.6, // Encourage novel content
          frequency_penalty: 0.8, // Discourage repetitive patterns
        }),
      });

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        console.error("Unexpected OpenAI response:", data);
        continue;
      }

      // Parse the content which should be JSON
      try {
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/(\{[\s\S]*\})/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const phraseData = JSON.parse(jsonStr);

        // Check if this phrase is too similar to recent ones
        const newPhrase = phraseData.phrase?.toLowerCase().trim();
        const isDuplicate = recentPhrasesText.some(recent => 
          recent.toLowerCase().trim() === newPhrase ||
          recent.toLowerCase().includes(newPhrase) ||
          newPhrase.includes(recent.toLowerCase())
        );

        if (!isDuplicate || attempts === maxAttempts) {
          generatedPhrase = phraseData;
          break;
        } else {
          console.log(`Attempt ${attempts}: Generated phrase too similar to recent ones, trying again...`);
        }
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError, data.choices[0]?.message?.content);
        if (attempts === maxAttempts) {
          return new Response(
            JSON.stringify({ error: "Failed to parse phrase data after multiple attempts" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!generatedPhrase) {
      return new Response(
        JSON.stringify({ error: "Failed to generate unique phrase after multiple attempts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the new phrase in the database (background task)
    // Note: EdgeRuntime.waitUntil is not available, using immediate async instead
    (async () => {
      try {
        // Insert new phrase
        const { error: insertError } = await supabase
          .from('recent_phrases')
          .insert({
            phrase: generatedPhrase.phrase,
            level: level,
            language: targetLanguage
          });

        if (insertError) {
          console.error("Error storing phrase:", insertError);
        } else {
          console.log("Phrase stored successfully");
        }

        // Clean up old phrases
        const { error: cleanupError } = await supabase
          .rpc('cleanup_old_phrases', {
            p_level: level,
            p_language: targetLanguage
          });

        if (cleanupError) {
          console.error("Error cleaning up old phrases:", cleanupError);
        } else {
          console.log("Old phrases cleaned up successfully");
        }
      } catch (error) {
        console.error("Background task error:", error);
      }
    })().catch(err => console.error('Background task failed:', err));

    console.log(`Successfully generated unique phrase after ${attempts} attempts`);

    return new Response(
      JSON.stringify(generatedPhrase),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-pronunciation-phrase function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});