
// analyze-speaking/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

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
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not found');
    }

    // Parse request body
    const { userTranscripts, aiResponses } = await req.json();
    
    console.log('Received transcripts for analysis:', {
      userTranscriptsCount: userTranscripts.length,
      aiResponsesCount: aiResponses.length
    });

    // Ensure we have data to analyze
    if (!userTranscripts || userTranscripts.length === 0) {
      throw new Error('No user transcripts provided');
    }

    // Compile conversation for analysis
    const conversation = [];
    const maxItems = Math.max(userTranscripts.length, aiResponses.length);
    
    for (let i = 0; i < maxItems; i++) {
      if (i < aiResponses.length) {
        conversation.push(`AI: ${aiResponses[i]}`);
      }
      if (i < userTranscripts.length) {
        conversation.push(`User: ${userTranscripts[i]}`);
      }
    }

    const conversationText = conversation.join('\n\n');
    
    console.log('Analyzing conversation sample:', conversationText.substring(0, 200) + '...');

    // Prepare OpenAI request for analysis
    const prompt = `
You are a CEFR (Common European Framework of Reference for Languages) expert assessing Spanish language skills.
Analyze the following conversation to evaluate the speaker's Spanish proficiency.

Conversation:
${conversationText}

Based on this conversation, assess the user's Spanish speaking and listening proficiency according to CEFR levels (A1, A2, B1, B2, C1, C2).

Consider:
1. Vocabulary range and accuracy
2. Grammatical complexity and correctness
3. Fluency and pronunciation (based on word choice and context)
4. Comprehension (based on appropriate responses)
5. Ability to express complex ideas
6. Use of idioms and cultural references

Respond with ONLY:
1. A JSON object containing:
   - level: The CEFR level (A1, A2, B1, B2, C1, C2)
   - score: A numeric score from 0-100
   - analysis: A brief expert assessment of strengths and areas for improvement

The output should be VALID JSON that can be parsed. Example:
{"level": "B1", "score": 65, "analysis": "The speaker demonstrates..."}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a language assessment expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data:', data);
    
    let result;
    
    try {
      // Extract content from OpenAI response
      const content = data.choices[0].message.content.trim();
      console.log('Raw content from OpenAI:', content);
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract JSON from OpenAI response');
      }
      
      // Validate the result structure
      if (!result.level || !result.score || !result.analysis) {
        throw new Error('Response missing required fields');
      }
      
      // Ensure score is a number between 0-100
      result.score = Math.max(0, Math.min(100, parseInt(result.score)));
      
      console.log('Processed assessment result:', result);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback to a default value if parsing fails
      result = { 
        level: "B1", 
        score: 50, 
        analysis: "Unable to properly analyze the conversation. The assessment system encountered technical difficulties." 
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in analyze-speaking function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      level: "B1",
      score: 50,
      analysis: "An error occurred while analyzing the conversation."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
