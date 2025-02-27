
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userTranscripts, aiResponses } = await req.json();

    // Format the conversation to make it easier for GPT to analyze
    let formattedConversation = '';
    const maxEntries = Math.max(userTranscripts.length, aiResponses.length);
    
    for (let i = 0; i < maxEntries; i++) {
      if (aiResponses[i]) {
        formattedConversation += `AI: ${aiResponses[i]}\n\n`;
      }
      if (userTranscripts[i]) {
        formattedConversation += `User: ${userTranscripts[i]}\n\n`;
      }
    }

    console.log("Formatted conversation:", formattedConversation);

    const systemPrompt = `You are an expert Spanish language proficiency evaluator following the CEFR (Common European Framework of Reference for Languages) standards. 
    
Analyze the following conversation between a student and an AI tutor to determine the student's CEFR level (A1-C2) for speaking and listening skills. 

Focus on these key aspects:
1. Speaking fluency and coherence
2. Vocabulary range and accuracy 
3. Grammatical accuracy and complexity
4. Pronunciation (based on transcribed text)
5. Listening comprehension (based on response relevance)

CEFR Level Guidelines:
- A1 (Beginner): Can use very basic phrases. Limited vocabulary to a small set of isolated words.
- A2 (Elementary): Can communicate in simple and routine tasks. Limited to familiar topics and basic needs.
- B1 (Intermediate): Can deal with most situations while traveling. Can describe experiences, events, dreams, hopes and ambitions.
- B2 (Upper Intermediate): Can interact with a degree of fluency and spontaneity. Can produce clear, detailed text on a wide range of subjects.
- C1 (Advanced): Can express themselves fluently and spontaneously. Can use language flexibly and effectively for social, academic and professional purposes.
- C2 (Proficiency): Can understand with ease virtually everything heard or read. Can express themselves spontaneously, very fluently and precisely.

Important: Be objective and accurate in your assessment. Do not inflate or deflate the level. Base your evaluation only on the evidence in the conversation.

Return your response in this format:
{
  "level": "[CEFR level: A1, A2, B1, B2, C1, or C2]",
  "score": [numerical score between 40-100],
  "analysis": "[your detailed analysis]"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: formattedConversation }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log("GPT response:", data);
    
    let analysis, level, score;
    
    try {
      // Parse the GPT response as JSON
      const parsedContent = JSON.parse(data.choices[0].message.content);
      analysis = parsedContent.analysis;
      level = parsedContent.level;
      score = parsedContent.score;
    } catch (parseError) {
      console.error("Error parsing GPT response:", parseError);
      
      // Fallback extraction if JSON parsing fails
      const content = data.choices[0].message.content;
      const levelMatch = content.match(/level"?\s*:\s*"?([A-C][12])"?/i);
      const scoreMatch = content.match(/score"?\s*:\s*(\d+)/i);
      
      level = levelMatch ? levelMatch[1] : 'B1';
      score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
      analysis = content;
    }
    
    return new Response(JSON.stringify({
      analysis,
      level,
      score,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-speaking function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
