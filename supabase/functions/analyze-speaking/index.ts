
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

    // Combine transcripts into a conversation format
    const conversation = userTranscripts.map((ut: string, i: number) => ({
      userSpeech: ut,
      aiResponse: aiResponses[i] || ''
    }));

    const systemPrompt = `You are a Spanish language proficiency evaluator. Analyze the following conversation between a student and an AI tutor to determine the student's CEFR level (A1-C2) for speaking and listening skills. Focus on:
1. Speaking fluency and coherence
2. Vocabulary range and accuracy
3. Grammatical accuracy
4. Pronunciation (based on transcribed text)
5. Listening comprehension (based on response relevance)

Consider:
- Length and complexity of responses
- Variety of vocabulary
- Grammatical structures used
- Appropriateness of responses
- Overall communication effectiveness

Provide:
1. CEFR level (A1-C2)
2. Brief explanation
3. Score (40-100)`;

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
          { role: 'user', content: JSON.stringify(conversation, null, 2) }
        ],
      }),
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Parse GPT's response to extract level and score
    const levelMatch = analysis.match(/CEFR level.*?([A-C][12])/i);
    const scoreMatch = analysis.match(/score.*?(\d+)/i);
    
    return new Response(JSON.stringify({
      analysis,
      level: levelMatch ? levelMatch[1] : 'B1',
      score: scoreMatch ? parseInt(scoreMatch[1]) : 70,
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
